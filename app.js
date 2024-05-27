const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const contactsRouter = require("./routes/api/contacts");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

main()
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => console.log(`Error: ${err.message}`));

async function main() {
  await mongoose.connect(
    "mongodb+srv://aynjel76:pBKgi7Iq5tclP3BB@cluster0.sir4r2u.mongodb.net/db-contacts"
  );
}

// test api status check
app.get("/", (req, res) => {
  res.json({ status: "success", code: 200 });
});

app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
