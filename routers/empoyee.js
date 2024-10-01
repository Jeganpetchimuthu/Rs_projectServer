const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected successfully!!!");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/", upload.single("image"), (req, res) => {
  const {
    employeeName,
    employeeId,
    department,
    designation,
    project,
    type,
    status,
  } = req.body;
  const image = req.file ? req.file.filename : null;

  const createData =
    "INSERT INTO employees (employeeName, employeeId, department, designation, project, type, status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    createData,
    [
      employeeName,
      employeeId,
      department,
      designation,
      project,
      type,
      status,
      image,
    ],
    (err, result) => {
      if (err) res.status(500).send("Database error");
      else res.status(201).send(`Employee created with ID: ${result.insertId}`);
    }
  );
});

router.get("/", (req, res) => {
  const getData = "SELECT * FROM employees";
  db.query(getData, (err, results) => {
    if (err) res.status(500).send("Database error");
    else res.json(results);
  });
});

router.put("/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
  const {
    employeeName,
    employeeId,
    department,
    designation,
    project,
    type,
    status,
  } = req.body;
  const image = req.file ? req.file.filename : null;

  const updateData = `UPDATE employees SET 
                   employeeName = ?, employeeId = ?, department = ?, designation = ?, 
                   project = ?, type = ?, status = ?, image = ? 
                   WHERE id = ?`;
  db.query(
    updateData,
    [
      employeeName,
      employeeId,
      department,
      designation,
      project,
      type,
      status,
      image,
      id,
    ],
    (err, result) => {
      if (err) res.status(500).send("Database error");
      else res.send(`Employee with ID: ${id} updated successfully`);
    }
  );
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const getDataId = "SELECT * FROM employees WHERE id = ?";
  db.query(getDataId, [id], (err, result) => {
    if (err) res.status(500).send("Database error");
    else if (result.length === 0) res.status(404).send("Employee not found");
    else res.json(result[0]);
  });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;

  const deleteData = "SELECT image FROM employees WHERE id = ?";
  db.query(deleteData, [id], (err, result) => {
    const imagePath = result[0].image;
    const deleteQuery = "DELETE FROM employees WHERE id = ?";
    if (imagePath) {
      const absolutePath = path.join(__dirname, "..", "uploads", imagePath);
      fs.unlink(absolutePath, (fsErr) => {
        if (fsErr) {
          res.status(500).send("Failed to delete image");
          return;
        }

        db.query(deleteQuery, [id], (err, result) => {
          if (err) res.status(500).send("Database error");
          else
            res.send(`Employee with ID: ${id} and image deleted successfully`);
        });
      });
    } else {
      db.query(deleteQuery, [id], (err, result) => {
        if (err) res.status(500).send("Database error");
        else res.send(`Employee with ID: ${id} deleted successfully`);
      });
    }
  });
});

module.exports = router;
