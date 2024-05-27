const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Set email for contact"],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, "Set phone for contact"],
    unique: true,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
});

const Contact = mongoose.model("contact", contactSchema);

module.exports = Contact;
