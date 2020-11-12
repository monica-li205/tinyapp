const {generateRandomString, getUserByEmail, urlsForUser} = require('./helpers');
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

let currentUser = {};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

app.get("/new", (req, res) => {
  const templateVars = {
    users: users,
    currentUser: currentUser,
    user_id: req.session.user_id,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let urls = urlsForUser(currentUser.user_id, urlDatabase);
  const templateVars = {
    users:users,
    currentUser: currentUser,
    urls: urls,
    user_id: req.session.user_id,
  };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    users: users,
    currentUser: currentUser,
    user_id: req.session.user_id,
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    users: users,
    currentUser: currentUser,
    user_id: req.session.user_id,
  };
  res.render('urls_login', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    urls: urlDatabase,
    key: shortURL,
    users: users,
    currentUser: currentUser,
    user_id: req.session.user_id,
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post('/register', (req, res) => {
  let id = generateRandomString();
  users[id] = {};
  users[id]['user_id'] = id;
  users[id]['email'] = req.body.email_register;
  users[id]['password'] = bcrypt.hashSync(req.body.password_register, 10);
  console.log(users);

  if (req.body.email === '' || !req.body.password === '' || getUserByEmail(req.body.email, users)) {
    console.log('8((');
    return res.sendStatus(400);

  } else {
    currentUser.user_id = users[id].user_id;
    currentUser.email = users[id].email;
    currentUser.password = users[id].password;
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = currentUser.user_id;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  let email = req.body.email_login;
  let password = req.body.password_login;

  if (!getUserByEmail(email, users)) {
    console.log('80');
    res.sendStatus(403);
  } else if (email === '' || password === '') {
    console.log('8((');
    res.sendStatus(400);
  } else if (getUserByEmail(email, users)) {
    let user = getUserByEmail(email, users);
    currentUser.user_id = users[user].user_id;
    currentUser.email = users[user].email;
    currentUser.password = users[user].password;

    if (bcrypt.compareSync(password, currentUser.password)) {
      console.log(currentUser);
      req.session.user_id = currentUser.user_id;
      res.redirect('/urls');
    } else {
      res.sendStatus(403);
    }
  }
});

app.post('/logout', (req, res) => {
  currentUser = {};
  req.session = null;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  let usersURLsArray = Object.keys(urlsForUser(currentUser.user_id, urlDatabase));
  if (usersURLsArray.includes(shortURL)) {
    console.log(urlDatabase[shortURL]);
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    return res.sendStatus(403);
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const newLongURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  let usersURLsArray = Object.keys(urlsForUser(currentUser.user_id, urlDatabase));
  if (usersURLsArray.includes(shortURL)) {
    urlDatabase[shortURL] = newLongURL;
    res.redirect('/urls');
  } else {
    return res.sendStatus(403);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

