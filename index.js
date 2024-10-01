const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
require("dotenv").config();
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

const employeeRoutes = require("./routers/empoyee");

app.use("/api/employees", employeeRoutes);

const PORT = process.env.PORT;
app.get("/read", (req, res) => {
  res.send("wecome");
});
app.listen(PORT, () => {
  console.log(`Server is  running on port ${PORT}`);
});
