const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");

const app = express();
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "meatconnect",
});

app.use(cors());
app.use(bodyParser.json());

conn.connect((error) => {
  if (error) throw error;
  console.log("Mysql connected");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "product/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

app.listen(8080, () => {
  console.log("Server running successfully in port 8080");
});

app.post("/user/login", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    conn.query(
      "SELECT * FROM user WHERE user_email = ? AND user_password = ?",
      [username, password],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          res.send(results);
          console.log(results);
        } else {
          res.send("Incorrect Username and/or Password");
        }
        res.end();
      }
    );
  } else {
    res.send("Please enter Username and Password!");
    res.end();
  }
});

const upload = multer({ storage: multer.memoryStorage() });

app.post("/user/register", function (req, res) {
  let progress = req.body.progress;
  let contacts = req.body.contacts;
  let address = req.body.address;
  let name = req.body.name;
  let username = req.body.username;
  let password = req.body.password;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let photo = "test";

  if (
    contacts &&
    address &&
    name &&
    username &&
    password &&
    firstName &&
    lastName
  ) {
    conn.query(
      "INSERT INTO user (progress_id, user_contacts, user_address, user_name, user_email, user_password, first_name, last_name, user_photo) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        progress,
        contacts,
        address,
        name,
        username,
        password,
        firstName,
        lastName,
        photo,
      ],
      function (error, results, fields) {
        if (error) throw error;
        else {
          res.send(results);
          console.log(results);
        }
      }
    );
  } else {
    res.send("Please input the needed fields");
    res.end();
  }
});

app.put("/user/update", upload.single("image"), function (req, res) {
  let id = req.body.id;
  let progress = req.body.progress;
  let contacts = req.body.contacts;
  let address = req.body.address;
  let name = req.body.name;
  let username = req.body.username;
  let password = req.body.password;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let photo = req.file ? req.file.buffer : null;

  conn.query(
    "UPDATE user SET progress_id = ?, user_contacts = ?, user_address = ?, user_name = ?, user_email = ?, user_password = ?, first_name = ?, last_name = ? , user_photo = ? WHERE user_id = ?",
    [
      progress,
      contacts,
      address,
      name,
      username,
      password,
      firstName,
      lastName,
      photo,
      id,
    ],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.put("/user/deactivate/:id", function (req, res) {
  conn.query(
    "DELETE FROM user WHERE user_id = ? ",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        console.log(rows);
        conn.query(
          "DELETE FROM animal_category WHERE user_id = ?",
          [req.params.id],
          function (aniError, aniRows, aniFields) {
            if (aniError) throw aniError;
            else {
              console.log(aniRows);
              conn.query(
                "DELETE FROM billing WHERE user_id = ?",
                [req.params.id],
                function (billError, billRows, billFields) {
                  if (billError) throw billError;
                  else {
                    console.log(billRows);
                    conn.query(
                      "DELETE FROM cart WHERE user_id = ? ",
                      [req.params.id],
                      function (cartError, cartRows, cartFields) {
                        if (cartError) throw cartError;
                        else {
                          console.log(cartRows);
                          conn.query(
                            "DELETE FROM comment WHERE user_id = ? ",
                            [req.params.id],
                            function (commError, commRows, commFields) {
                              if (commError) throw commError;
                              else {
                                conn.query(
                                  "DELETE FROM message WHERE receiver_id = ? OR sender_id = ? ",
                                  [req.params.id, req.params.id],
                                  function (messError, messRows, messFields) {
                                    if (messError) throw messError;
                                    else {
                                      conn.query(
                                        "DELETE FROM `order` WHERE user_id = ?",
                                        [req.params.id],
                                        function (
                                          orderError,
                                          orderRows,
                                          orderFields
                                        ) {
                                          if (orderError) throw orderError;
                                          else {
                                            res.send(rows);
                                            res.end();
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

app.get("/user/retrieve", function (req, res) {
  conn.query("SELECT * FROM user", function (error, rows, fields) {
    if (error) throw error;
    else {
      res.send(rows);
      console.log(rows);
      res.end();
    }
  });
});

app.post("/post/retrieve", function (req, res) {
  conn.query("SELECT * FROM post_status", function (error, rows, fields) {
    if (error) throw error;
    else {
      res.send(rows);
      console.log(rows);
      res.end();
    }
  });
});

app.post("/post/retrieveById/", function (req, res) {
  let id = req.body.id;
  conn.query(
    "SELECT * FROM search WHERE user_id = ?",
    [id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.post("/insert/cart", function (req, res) {
  let user_id = req.body.user_id;
  let livestock_animal_id = req.body.livestock_animal_id;
  let quantity = req.body.quantity;
  let created_at = new Date();
  let updated_at = new Date();

  conn.query(
    "INSERT INTO cart (user_id, livestock_animal_id, quantity, created_at, updated_at) VALUES (?,?,?,?,?)",
    [user_id, livestock_animal_id, quantity, created_at, updated_at],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
      }
    }
  );
});

app.get("/cart/checkCart/:id/:animal_id", function (req, res) {
  conn.query(
    "SELECT * FROM cart WHERE user_id = ? AND livestock_animal_id = ?",
    [req.params.id, req.params.animal_id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.get("/cart/retrieveAll/:id", function (req, res) {
  conn.query(
    "SELECT DISTINCT  * FROM cart INNER JOIN animal_category on animal_category.livestock_animal_id = cart.livestock_animal_id WHERE cart.user_id = ?",
    [req.params.id],
    function (error, rows, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving animals" });
      } else {
        // Map the rows to include the base64 encoded photo instead of the buffer
        const animals = rows.map((row) => ({
          ...row,
          livestock_animal_photo: row.livestock_animal_photo.toString("base64"),
        }));

        res.json({ animals });
      }
    }
  );
});

app.delete("/cart/delete/:id", function (req, res) {
  conn.query("DELETE FROM cart WHERE cart_id = ? ", [req.params.id]),
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
      }
    };
});

app.put("/update/cart/:id", function (req, res) {
  const livestock_animal_id = req.body.livestock_animal_id;
  const quantity = req.body.quantity;

  if (quantity === 0) {
    conn.query(
      "DELETE FROM cart WHERE livestock_animal_id = ? AND user_id = ?",
      [livestock_animal_id, req.params.id]
    ),
      function (error, rows, fields) {
        if (error) throw error;
        else {
          res.send(rows);
        }
      };
  } else {
    conn.query(
      "UPDATE cart SET quantity = ? WHERE user_id = ? AND livestock_animal_id = ?",
      [quantity, req.params.id, livestock_animal_id],
      function (error, rows, fields) {
        if (error) throw error;
        else {
          res.send(rows);
        }
      }
    );
  }
});

app.get("/user/retrieve/:id", function (req, res) {
  conn.query(
    "SELECT * FROM user WHERE user_id = ?",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        const user = rows.map((row) => ({
          ...row,
          user_photo: row.user_photo?.toString("base64"),
        }));
        res.json({ user });
      }
    }
  );
});

app.get("/chat/retrieveAllMessage/:id", function (req, res) {
  conn.query(
    "SELECT * FROM message WHERE receiver_id = ? ",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.delete("/chat/deleteChat/:id", function (req, res) {
  conn.query(
    "DELETE FROM message WHERE message_id = ?",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.get("/chat/retrieveMessage/:receiver_id/:sender_id", function (req, res) {
  conn.query(
    "SELECT * FROM message WHERE receiver_id = ? AND sender_id = ? ORDER BY created_at ASC",
    [req.params.receiver_id, req.params.sender_id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.post("/chat/insert", function (req, res) {
  const receiver_id = req.body.receiver_id;
  const sender_id = req.body.sender_id;
  const message_chat = req.body.message_chat;

  conn.query(
    "INSERT INTO message (receiver_id, sender_id, message_chat) VALUES (?,?,?)",
    [receiver_id, sender_id, message_chat],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
      }
    }
  );
});

app.get("/animal/retrieveByUser/:id", function (req, res) {
  conn.query(
    "SELECT * FROM animal_category WHERE user_id = ? ORDER BY created_at ASC",
    [req.params.id],
    function (error, rows, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving animals" });
      } else {
        // Map the rows to include the base64 encoded photo instead of the buffer
        const animals = rows.map((row) => ({
          ...row,
          livestock_animal_photo: row.livestock_animal_photo.toString("base64"),
        }));

        res.json({ animals });
      }
    }
  );
});

app.post("/animal/insertAnimal", upload.single("image"), function (req, res) {
  const toDate = new Date();
  const {
    user_id,
    breeding_type,
    animal_name,
    animal_type,
    animal_detail,
    stock,
    price,
  } = req.body;

  const animal_photo = req.file ? req.file.buffer : null;

  const created_at = toDate;
  const updated_at = toDate;

  conn.query(
    "INSERT INTO animal_category (user_id, breeding_type, livestock_animal_name, livestock_animal_type, livestock_animal_detail, livestock_animal_photo, livestock_animal_price, livestock_animal_stock, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      user_id,
      breeding_type,
      animal_name,
      animal_type,
      animal_detail,
      animal_photo,
      price,
      stock,
      created_at,
      updated_at,
    ],
    function (error, rows, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Error inserting animal" });
      } else {
        console.log(rows);
        res.status(201).json({ success: true });
      }
    }
  );
});

app.put(
  "/animal/updateAnimal/:id",
  upload.single("image"),
  function (req, res) {
    const toDate = new Date();
    const breeding_type = req.body.breeding_type;
    const animal_name = req.body.animal_name;
    const animal_type = req.body.animal_type;
    const animal_detail = req.body.animal_detail;
    const animal_photo = req.file ? req.file.buffer : null;
    const price = req.body.animal_price;
    const stock = req.body.stock;
    const updated_at = toDate;

    conn.query(
      "UPDATE animal_category SET breeding_type = ?,  livestock_animal_name = ? , livestock_animal_type = ?, livestock_animal_detail = ?, livestock_animal_photo = ?, livestock_animal_price = ? , livestock_animal_stock =? , updated_at = ? WHERE livestock_animal_id = ? ",
      [
        breeding_type,
        animal_name,
        animal_type,
        animal_detail,
        animal_photo,
        price,
        stock,
        updated_at,
        req.params.id,
      ],
      function (error, rows, fields) {
        if (error) throw error;
        else {
          res.send(rows);
          console.log(rows);
          res.end();
        }
      }
    );
  }
);

app.put("/animal/updateStock/:id", function (req, res) {
  const user_id = req.params.id;
  const livestock_animal_id = req.body.livestock_animal_id;
  const quantity = req.body.quantity;
  const updated_at = new Date();

  conn.query(
    "UPDATE animal_category SET livestock_animal_stock = ?, updated_at = ? WHERE user_id = ? AND livestock_animal_id = ?",
    [quantity, updated_at, user_id, livestock_animal_id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.delete("/animal/deleteAnimal/:id", function (req, res) {
  conn.query(
    "DELETE FROM animal_category WHERE livestock_animal_id = ?",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.get("/animal/retrieveById/:id", function (req, res) {
  conn.query(
    "SELECT * FROM animal_category, user where livestock_animal_id = ? && animal_category.user_id = user.user_id",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.get("/animal/retrieveByTyp/:type", function (req, res) {
  conn.query(
    "SELECT * FROM animal_category WHERE livestock_animal_type = ?",
    [req.params.type],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        console.log(rows);
        res.send(rows);
        res.end();
      }
    }
  );
});

app.get("/animal/retrieveByIdAndRatings/:id", function (req, res) {
  conn.query(
    "SELECT * FROM animal_category INNER JOIN user_rating ON user_rating.livestock_animal_id = animal_category.livestock_animal_id INNER JOIN comment ON comment.livestock_animal_id = animal_category.livestock_animal_id WHERE animal_category.livestock_animal_id = ?",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
      }
    }
  );
});

app.get("/animal/retrieveAllByStatus/", function (req, res) {
  conn.query(
    "SELECT * FROM animal_category INNER JOIN user ON user.user_id = animal_category.user_id WHERE animal_category.`status`= 1",
    function (error, rows, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving animals" });
      } else {
        const animals = rows.map((row) => ({
          ...row,
          livestock_animal_photo: row.livestock_animal_photo.toString("base64"),
        }));

        res.json({ animals });
      }
    }
  );
});

app.get("/animal/retrieveAll/", function (req, res) {
  conn.query(
    "SELECT *FROM animal_category JOIN user ON animal_category.user_id = user.user_id;",
    function (error, rows, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving animals" });
      } else {
        // Map the rows to include the base64 encoded photo instead of the buffer
        const animals = rows.map((row) => ({
          ...row,
          livestock_animal_photo: row.livestock_animal_photo.toString("base64"),
        }));

        res.json({ animals });
      }
    }
  );
});

app.get("/comment/retrieveByAnimal/:id", function (req, res) {
  conn.query(
    "SELECT * FROM COMMENT INNER JOIN user ON user.user_id = COMMENT.user_id  WHERE COMMENT.livestock_animal_id = ? ORDER BY COMMENT.created_at ASC",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.delete("/comment/deleteComment/:id", function (req, res) {
  conn.query(
    "DELETE FROM comment WHERE comment_id = ? ",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.post("/comment/addComment/:user_id", function (req, res) {
  let animal_id = req.body.livestock_animal_id;
  let message = req.body.message;
  let created_at = new Date();
  let updated_at = new Date();

  conn.query(
    "INSERT INTO comment(comment_message, user_id, livestock_animal_id, created_at, updated_at) VALUES(?,?,?,?,?)",
    [message, req.params.user_id, animal_id, created_at, updated_at],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.post("/billing/saveBilling/:id", function (req, res) {
  const user_id = req.params.id;
  const {
    payment_id,
    first_name,
    last_name,
    email,
    address,
    addressTwo,
    country,
    state,
    zip,
    phone,
  } = req.body;
  const created_at = new Date();
  const updated_at = new Date();

  conn.query(
    "INSERT INTO billing(user_id, payment_id, first_name, last_name, email, address, addressTwo, country, state, zip, phone, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      user_id,
      payment_id,
      first_name,
      last_name,
      email,
      address,
      addressTwo,
      country,
      state,
      zip,
      phone,
      created_at,
      updated_at,
    ],
    function (error, rows, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Error inserting billing " });
      } else {
        conn.query(
          "SELECT * FROM billing WHERE billing_id = (SELECT MAX(billing_id) FROM billing)",
          function (errors, row, field) {
            if (errors) {
              console.error(errors);
              res.status(500).json({
                error: "Error Retrieving the last Billing data",
              });
            } else {
              console.log(row);
              res.send(row);
              res.end();
            }
          }
        );
      }
    }
  );
});

app.post("/payment/insertPayment", function (req, res) {
  const {
    payment_type,
    card_number,
    card_expiry_date,
    card_full_name,
    card_cvv,
  } = req.body;
  const created_at = new Date();
  const updated_at = new Date();

  conn.query(
    "INSERT INTO payment_method(payment_type, card_number, card_expiry_date, card_full_name, card_cvv, created_at, updated_at) VALUES(?,?,?,?,?,?,?)",
    [
      payment_type,
      card_number,
      card_expiry_date,
      card_full_name,
      card_cvv,
      created_at,
      updated_at,
    ],
    function (error, rows, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({
          error: "Error inserting billing ",
        });
      } else {
        conn.query(
          "SELECT * FROM payment_method WHERE payment_id = (SELECT MAX(payment_id) FROM payment_method)",
          function (errors, row, field) {
            if (errors) {
              console.error(errors);
              res.status(500).json({
                error: "Error Retrieving the last data",
              });
            } else {
              console.log(row);
              res.send(row);
              res.end();
            }
          }
        );
      }
    }
  );
});

app.post("/order/insertOrder/:id", function (req, res) {
  const {
    order_number,
    user_id,
    livestock_animal_id,
    billing_id,
    quantity,
    price,
  } = req.body;
  const arrived_date = new Date();
  const created_at = new Date();
  const updated_at = new Date();
  conn.query(
    "INSERT INTO `order`(order_number, user_id, livestock_animal_id, billing_id, quantity, price, status, arrived_date, notification ,created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
    [
      order_number,
      parseInt(user_id, 10),
      livestock_animal_id,
      billing_id,
      quantity,
      price,
      "Pending",
      arrived_date,
      1,
      created_at,
      updated_at,
    ],
    function (error, rows, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({
          error: "Error Retrieving the last data",
        });
      } else {
        console.log(rows);
        conn.query(
          "SELECT * FROM animal_category WHERE livestock_animal_id = ?",
          [livestock_animal_id],
          function (aniError, aniRow, aniField) {
            if (aniError) {
              console.error(aniError);
              res.status(500).json({
                error: "Error retrieving animal Category",
              });
            } else {
              console.log(aniRow[0].livestock_animal_stock);
              conn.query(
                "UPDATE animal_category SET livestock_animal_stock = ? WHERE user_id = ? AND livestock_animal_id = ?",
                [
                  aniRow[0].livestock_animal_stock - quantity,
                  user_id,
                  livestock_animal_id,
                ],
                function (errors, row, field) {
                  if (errors) {
                    console.error(errors);
                    res.status(500).json({
                      error: "Error Updated animal category",
                    });
                  } else {
                    console.log(row);
                    conn.query(
                      "DELETE FROM cart WHERE cart_id = ?",
                      [req.params.id],
                      function (cartError, cartRow, cartField) {
                        if (cartError) {
                          console.error(cartError);
                          cartRow.status(500).json({
                            error: "Error deleting Card",
                          });
                        } else {
                          console.log(cartRow);
                          res.send(cartRow);
                          res.end();
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

app.put("/update/animalStatus/:user_id/:animal_id", function (req, res) {
  conn.query(
    "UPDATE animal_category SET `status` = ? WHERE user_id = ? AND livestock_animal_id = ?",
    [1, req.params.user_id, req.params.animal_id],
    function (error, rows, field) {
      if (error) throw error;
      else {
        console.log(rows);
        res.send(rows);
        res.end();
      }
    }
  );
});

app.post("/insert/report/:reporter_id/:reported_id", function (req, res) {
  const created_at = new Date();
  const updated_at = new Date();
  conn.query(
    "INSERT INTO report(reported_id, reporter_id, created_at, updated_at) VALUES(?,?,?,?)",
    [req.params.reporter_id, req.params.reported_id, created_at, updated_at],
    function (error, rows, field) {
      if (error) throw error;
      else {
        console.log(rows);
        res.send(rows);
        res.end();
      }
    }
  );
});

app.post("/insert/userRating/:id", function (req, res) {
  let animal_id = req.body.livestock_animal_id;
  let rate = req.body.rating;
  let created_at = new Date();
  let updated_at = new Date();

  conn.query(
    "SELECT * FROM user_rating WHERE user_id = ? AND livestock_animal_id = ?",
    [req.params.id, animal_id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        if (rows.length === 0) {
          conn.query(
            "INSERT INTO user_rating(user_id, livestock_animal_id, rating_star, created_at, updated_at) VALUES(?,?,?,?,?)",
            [req.params.id, animal_id, rate, created_at, updated_at],
            function (insRateError, insRateRows, fields) {
              if (insRateError) throw insRateError;
              else {
                res.send(insRateRows);
                console.log(insRateRows);
                res.end();
              }
            }
          );
        } else {
          conn.query(
            "UPDATE user_rating SET rating_star = ? WHERE user_id = ? AND livestock_animal_id = ?",
            [rate, req.params.id, animal_id],
            function (upadteError, updateRows, fields) {
              if (upadteError) throw upadteError;
              else {
                res.send(updateRows);
                console.log(updateRows);
                res.end();
              }
            }
          );
        }
      }
    }
  );
});

app.get("/get/ratings/:id", function (req, res) {
  conn.query(
    "SELECT * FROM user_rating WHERE livestock_animal_id = ?",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        console.log(rows);
        res.send(rows);
        res.end();
      }
    }
  );
});

app.post("/rate/rateUser/:id", function (req, res) {
  const rater_id = req.body.rater_id;
  const rate = req.body.rate;
  const created_at = new Date();
  const updated_at = new Date();

  conn.query(
    "INSERT INTO ratings(user_id, rater_id, rate, created_at, updated_at) VALUES(?,?,?,?,?)",
    [req.params.id, rater_id, rate, created_at, updated_at],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.get("/order/retrieveByUser/:id", function (req, res) {
  conn.query(
    "SELECT * FROM `order` INNER JOIN user ON user.user_id = `order`.user_id INNER JOIN animal_category ON animal_category.livestock_animal_id = `order`.livestock_animal_id INNER JOIN billing ON billing.billing_id = `order`.billing_id WHERE `order`.user_id = ?",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

app.get("/order/retrieveHistory/:id", function (req, res) {
  conn.query(
    "SELECT * FROM `order` INNER JOIN user ON user.user_id = `order`.user_id INNER JOIN animal_category ON animal_category.livestock_animal_id = `order`.livestock_animal_id INNER JOIN billing ON billing.billing_id = `order`.billing_id WHERE `order`.user_id = ? AND `order`.status = ?",
    [req.params.id, "Delivered"],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
        res.end();
      }
    }
  );
});

///GETE ALL ORDER IN Bu TAB

app.get("/order/getAllOrderByUser/:id", function (req, res) {
  conn.query(
    "SELECT `order`.*, user.* FROM `order` INNER JOIN user ON `order`.user_id = user.user_id WHERE `order`.user_id = ? AND `order`.status != 'completed'",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
      }
    }
  );
});

// Seller tab

app.get("/order/getAllOrderBySeller/:id", function (req, res) {
  conn.query(
    "SELECT o.order_id, o.order_number,o.status, o.price, o.quantity ,u.first_name, u.user_address, u.last_name, l.livestock_animal_name FROM `order` o JOIN user u ON o.user_id = u.user_id JOIN animal_category l ON o.livestock_animal_id = l.livestock_animal_id WHERE l.user_id  = ?",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
      }
    }
  );
});

app.put("/order/toShipStatus/:id", function (req, res) {
  // BUYER: PENDING S: SEND ITEM B:TO SHIP B: COMPLETED S: COMPLETED
  let status = req.body.status;
  let notification = 1;
  if (status === "Pending") {
    status = "To ship";
  }
  if (status === "To ship") {
    status = "Completed";
  }
  conn.query(
    "UPDATE `order` SET status = ? , notification = ? WHERE order_id = ?",
    [status, notification, req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
      }
    }
  );
});

app.get("/ratings/retrieveAll", function (req, res) {
  conn.query(
    "SELECT * FROM user_rating INNER JOIN user ON user.user_id = user_rating.user_id INNER JOIN animal_category ON animal_category.livestock_animal_id = user_rating.livestock_animal_id",
    function (error, rows, fields) {
      if (error) throw WebGLVertexArrayObject;
      else {
        res.send(rows);
      }
    }
  );
});

app.get("/getNotification/:id", function (req, res) {
  conn.query(
    "SELECT o.user_id, o.notification, o.order_id, o.order_number,o.status, o.price, o.quantity ,u.first_name, u.user_address, u.last_name, l.livestock_animal_name  FROM `order` o JOIN user u ON o.user_id = u.user_id JOIN animal_category l ON o.livestock_animal_id = l.livestock_animal_id WHERE l.user_id = ? OR u.user_id = ? ORDER BY o.updated_at DESC LIMIT 5;",
    [req.params.id, req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
      }
    }
  );
});

app.put("/updateNotif/:id", function (req, res) {
  let notification = 0;
  conn.query(
    "UPDATE `order` SET notification = ? WHERE order_id = ?",
    [notification, req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
      }
    }
  );
});

app.get("/getUserByID/:id", function (req, res) {
  conn.query(
    "SELECT  * FROM `user` WHERE user_id = ?",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
        console.log(rows);
      }
    }
  );
});

app.get("/getInvoice/:id", function (req, res) {
  conn.query(
    "SELECT a.livestock_animal_name, o.order_number, o.created_at, o.price, o.quantity, b.address, p.payment_type FROM billing b JOIN payment_method p ON p.payment_id = b.payment_id JOIN `order` o ON o.billing_id = b.billing_id JOIN animal_category a ON o.livestock_animal_id = a.livestock_animal_id WHERE o.order_id = ?",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
      }
    }
  );
});

app.get("/search/:searchString", function (req, res) {
  conn.query(
    `SELECT * FROM animal_category WHERE STATUS = 1 AND (livestock_animal_name LIKE '%${req.params.searchString}%' OR livestock_animal_type LIKE '%${req.params.searchString}%' OR livestock_animal_detail LIKE '%${req.params.searchString}%')`,
    function (error, rows, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving animals" });
      } else {
        // Map the rows to include the base64 encoded photo instead of the buffer
        const animals = rows.map((row) => ({
          ...row,
          livestock_animal_photo: row.livestock_animal_photo.toString("base64"),
        }));

        res.json({ animals });
      }
    }
  );
});

app.put("/update/LiveStock/:id", function (req, res) {
  let quantity = req.body.livestock_animal_stock;
  conn.query(
    "UPDATE animal_category SET livestock_animal_stock = livestock_animal_stock - ? WHERE livestock_animal_id = ?",
    [quantity, req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
      }
    }
  );
});

app.get("/salesHistory/:id", function (req, res) {
  conn.query(
    "SELECT a.livestock_animal_name, SUM(o.price * o.quantity) AS total_sales, (a.livestock_animal_stock - SUM(o.quantity)) AS remaining,livestock_animal_stock, a.livestock_animal_price, o.quantity FROM animal_category a JOIN `order` o ON a.livestock_animal_id = o.livestock_animal_id WHERE a.user_id = ? GROUP BY a.livestock_animal_id, o.quantity",
    [req.params.id],
    function (error, rows, fields) {
      if (error) throw error;
      else {
        res.send(rows);
      }
    }
  );
});
