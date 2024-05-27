const Contact = require("../db/schema/contacts");

async function index(req, res, next) {
  try {
    const contacts = await Contact.find();
    res.json({ status: "success", code: 200, data: { contacts } });
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ status: "success", code: 200, data: { contact } });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ status: "success", code: 201, data: { contact } });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findByIdAndDelete(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ status: "success", code: 200, data: { contact } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ status: "success", code: 200, data: { contact } });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, create, destroy, update };
