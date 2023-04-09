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
  console.log(req);
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

app.post("/user/register", function (req, res) {
  console.log(req.bod);
  let progress = req.body.progress;
  let contacts = req.body.contacts;
  let address = req.body.address;
  let name = req.body.name;
  let username = req.body.username;
  let password = req.body.password;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;

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
      "INSERT INTO user (progress_id, user_contacts, user_address, user_name, user_email, user_password, first_name, last_name) VALUES (?,?,?,?,?,?,?,?)",
      [
        progress,
        contacts,
        address,
        name,
        username,
        password,
        firstName,
        lastName,
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

app.post("/user/update", function (req, res) {
  let id = req.body.id;
  let progress = req.body.progress;
  let contacts = req.body.contacts;
  let address = req.body.address;
  let name = req.body.name;
  let username = req.body.username;
  let password = req.body.password;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;

  conn.query(
    "UPDATE user SET progress_id = ?, user_contacts = ?, user_address = ?, user_name = ?, user_email = ?, user_password = ?, first_name = ?, last_name = ? WHERE user_id = ?",
    [
      progress,
      contacts,
      address,
      name,
      username,
      password,
      firstName,
      lastName,
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

app.put("/update/cart/:id", function (req, res) {
  let livestock_animal_id = req.body.livestock_animal_id;
  let quantity = req.body.quantity;

  if (quantity === 0) {
    conn.query(
      "DELETE FROM cart WHERE livestock_animal_id = ? AND user_id = ?",
      [livestock_animal_id, req.params.id]
    ),
      function (error, rows, fields) {
        if (error) throw error;
        else {
          res.send(rows);
          console.log(rows);
          res.end();
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
          console.log(rows);
          res.send();
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
        res.send(rows);
        console.log(rows);
        res.end();
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

const upload = multer({ storage: multer.memoryStorage() });

app.post("/animal/insertAnimal", upload.single("image"), function (req, res) {
  const toDate = new Date();
  const { user_id, animal_name, animal_type, animal_detail, stock } = req.body;

  const animal_photo = req.file ? req.file.buffer : null;

  const created_at = toDate;
  const updated_at = toDate;

  conn.query(
    "INSERT INTO animal_category (user_id, livestock_animal_name, livestock_animal_type, livestock_animal_detail, livestock_animal_photo, livestock_animal_stock, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      user_id,
      animal_name,
      animal_type,
      animal_detail,
      animal_photo,
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
    "SELECT * FROM animal_category where livestock_animal_id = ?",
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

app.get("/animal/retrieveAll/", function (req, res) {
  conn.query("SELECT * FROM animal_category", function (error, rows, fields) {
    if (error) throw error;
    else {
      res.send(rows);
      console.log(rows);
      res.end();
    }
  });
});

app.put("/animal/updateAnimal/:id", function (req, res) {
  const toDate = new Date();
  const animal_name = req.body.animal_name;
  const animal_type = req.body.animal_type;
  const animal_detail = req.body.animal_detail;
  const animal_photo = req.body.animal_photo;
  const stock = req.body.stock;
  const updated_at = toDate;

  conn.query(
    "UPDATE animal_category SET livestock_animal_name = ? , livestock_animal_type = ?, livestock_animal_detail = ?, livestock_animal_photo = ? , livestock_animal_stock =? , updated_at = ? WHERE livestock_animal_id = ? ",
    [
      animal_name,
      animal_type,
      animal_detail,
      animal_photo,
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
});
