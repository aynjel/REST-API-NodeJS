const express = require("express");
const router = express.Router();
const contactsController = require("./../../controller/contactsController");

router.get("/", contactsController.index);

router.get("/:contactId", contactsController.show);

router.post("/", contactsController.create);

router.delete("/:contactId", contactsController.destroy);

router.put("/:contactId", contactsController.update);

module.exports = router;
