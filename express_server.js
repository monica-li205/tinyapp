const {generateRandomString, getUserByEmail, urlsForUser} = require('./helpers');
const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// temporary storage containing the current user's id, email and password. Is wiped after logout
let currentUser = {};

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

app.get("/", (req, res) => {
  if (currentUser.user_id) {
    res.redirect("/urls");
  } else if (!currentUser.id) {
    res.redirect("/login");
  }
});

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
  if (currentUser.user_id) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars);
  }
});

app.get('/login', (req, res) => {
  const templateVars = {
    users: users,
    currentUser: currentUser,
    user_id: req.session.user_id,
  };
  if (currentUser.user_id) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', templateVars);
  }
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
  const regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  if (!regexp.test(longURL)) {
    return res.status(400).send('your URL is not valid');
  } else if (longURL[0] !== 'h') {
    res.redirect(`https://${longURL}`);
  } else {
    res.redirect(longURL);
  }
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
    return res.status(400).send('please enter a valid email and password');

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
    res.status(403).send('you do not have permission to perform this action!');
  } else if (email === '' || password === '') {
    console.log('8((');
    res.status(400).send('Please enter a valid email and password');
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
      res.status(403).send('you do not have permission to perform this action!');
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
    return res.status(403).send('you do not have permission to perform this action!');
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
    return res.status(403).send('you do not have permission to perform this action!');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

