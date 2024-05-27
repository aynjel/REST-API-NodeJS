const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

const contactsPath = "./db";

async function listContacts() {
  try {
    const data = await fs.readFile(path.join(contactsPath, "contacts.json"));
    const contacts = JSON.parse(data);
    return contacts;
  } catch (error) {
    console.error(error.message);
  }
}

async function getContactById(contactId) {
  try {
    const contacts = await listContacts();
    const contact = contacts.find(({ id }) => id === contactId);
    if (!contact) {
      throw new Error(`Contact with id=${contactId} not found`);
    }
    return contact;
  } catch (error) {
    console.error(error.message);
  }
}

async function removeContact(contactId) {
  try {
    const contacts = await listContacts();
    const index = contacts.findIndex(({ id }) => id === contactId);
    if (index === -1) {
      throw new Error(`Contact with id=${contactId} not found`);
    }
    const newContacts = contacts.filter(({ id }) => id !== contactId);
    await fs.writeFile(
      path.join(contactsPath, "contacts.json"),
      JSON.stringify(newContacts, null, 2)
    );
    return contacts[index];
  } catch (error) {
    console.error(error.message);
  }
}

async function addContact(name, email, phone) {
  try {
    const contacts = await listContacts();
    const createdId = crypto.randomUUID();

    const newContact = { id: createdId, name, email, phone };
    const newContacts = [...contacts, newContact];
    await fs.writeFile(
      path.join(contactsPath, "contacts.json"),
      JSON.stringify(newContacts, null, 2)
    );
    return newContact;
  } catch (error) {
    console.error(error.message);
  }
}

async function updateContact(contactId, body) {
  try {
    const contacts = await listContacts();
    const index = contacts.findIndex(({ id }) => id === contactId);
    if (index === -1) {
      throw new Error(`Contact with id=${contactId} not found`);
    }
    const updatedContact = { ...contacts[index], ...body };
    const newContacts = [
      ...contacts.slice(0, index),
      updatedContact,
      ...contacts.slice(index + 1),
    ];
    await fs.writeFile(
      path.join(contactsPath, "contacts.json"),
      JSON.stringify(newContacts, null, 2)
    );
    return updatedContact;
  } catch (error) {
    console.error(error.message);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
