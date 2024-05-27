## Express API with MongoDB

### Description:

This is a simple Express API with MongoDB. It has a single endpoint `/api/contacts` that allows to create, read, update and delete contacts.

### Examples of requests and responses:

- GET /api/contacts
  ```json
  [
    {
      "favorite": false,
      "_id": "6650000591c04bd9ba94e6fa",
      "name": "Alec Howard",
      "email": "test@g.net",
      "phone": "(748) 206-2688"
    },
    {
      "favorite": false,
      "_id": "6650000591c04bd9ba94e6f5",
      "name": "Cyrus Jackson",
      "email": "nibh@semsempererat.com",
      "phone": "(501) 472-5218"
    },
    {
      "favorite": false,
      "_id": "6650000591c04bd9ba94e6f3",
      "name": "Allen Raymond",
      "email": "nulla.ante@vestibul.co.uk",
      "phone": "(992) 914-3792"
    }
  ]
  ```
- GET /api/contacts/6650000591c04bd9ba94e6fa

  ```json
  {
    "favorite": false,
    "_id": "6650000591c04bd9ba94e6fa",
    "name": "Alec Howard",
    "email": "test@g.net",
    "phone": "(748) 206-2688"
  }
  ```

- POST /api/contacts

  ```json
  {
    "favorite": false,
    "_id": "6650000591c04bd9ba94e6fa",
    "name": "Alec Howard",
    "email": "test@g.net",
    "phone": "(748) 206-2688"
  }
  ```

- PUT /api/contacts/6650000591c04bd9ba94e6fa

  ```json
  {
    "favorite": true,
    "_id": "6650000591c04bd9ba94e6fa",
    "name": "Alec Howard updated",
    "email": "updatedemail@g.net",
    "phone": "(748) 206-2688"
  }
  ```

- DELETE /api/contacts/6650000591c04bd9ba94e6fa

  ```json
  {
    "favorite": true,
    "_id": "6650000591c04bd9ba94e6fa",
    "name": "Alec Howard updated",
    "email": "updatedemail@g.net",
    "phone": "(748) 206-2688"
  }
  ```

### Endpoints and Methods:

- `GET /api/contacts` &mdash; returns all contacts.
- `POST /api/contacts` &mdash; creates a new contact.
- `GET /api/contacts/:id` &mdash; returns a single contact by id.
- `PUT /api/contacts/:id` &mdash; updates a contact by id.

### Technologies:

- Node.js
- Express
- MongoDB
- Mongoose

### Commands:

- `npm start` &mdash; starts the server in production mode.
- `npm run start:dev` &mdash; starts the server in development mode.
- `npm run lint` &mdash; runs eslint to check the code. Make sure to execute this before each PR and fix all linting errors.
- `npm lint:fix` &mdash; same as the previous command but fixes simple linting errors automatically.
