const bcrypt = require('bcrypt');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomuser_id" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2" },
};

const users = {
  "userRandomuser_id": {
    user_id: "userRandomuser_id",
    email: "user@example.com",
    password: bcrypt.hashSync("purple", 10),
  },
  "user2" : {
    user_id: 'user2',
    email: 'user2@mail.com',
    password: bcrypt.hashSync('1234',10),
  }
};

module.exports = { urlDatabase, users };