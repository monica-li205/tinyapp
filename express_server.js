// const { response } = require("express");
const express = require("express");
const app = express();
const CookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(CookieParser());

let currentUser = {};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomuser_id": {
    user_id: "userRandomuser_id",
    email: "user@example.com",
    password: "purple"
  },
  "user2" : {
    user_id: 'user2000',
    email: 'user2@mail.com',
    password: '1234',
  }
};

app.get("/new", (req, res) => {
  const templateVars = {
    users: users,
    currentUser: currentUser,
    user_id: req.cookies['user_id'],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let urls = urlsForUser(currentUser.user_id);
  const templateVars = {
    users:users,
    currentUser: currentUser,
    urls: urls,
    user_id: req.cookies['user_id'],
  };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    users: users,
    currentUser: currentUser,
    user_id: req.cookies['user_id'],
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    users: users,
    currentUser: currentUser,
    user_id: req.cookies['user_id'],
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
    user_id: req.cookies['user_id'],
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
  users[id]['password'] = req.body.password_register;
  console.log(users);

  if (req.body.email === '' || !req.body.password === '' || emailLookupHelper(req.body.email)) {
    console.log('8((');
    return res.sendStatus(400);

  } else {
    res.cookie('user_id', id);
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

  if (emailLookupHelper(email)) {
    console.log('>8" (((((')
    return res.sendStatus(403);
  } else if(email === '' || password === '') {
    console.log('>80')
    res.sendStatus(400)
  } else {
    for (let user in users) {
      if (users[user].email === email) {
        console.log('8))')
        currentUser.user_id = users[user].user_id;
        currentUser.email = users[user].email;
        currentUser.password = users[user].password;
        if (password === currentUser.password) {
          console.log(currentUser);
          res.cookie('user_id', currentUser.user_id);
          res.redirect('/urls');
        } else {
          res.sendStatus(403);
        }
      } 
    }
  }
});

app.post('/logout', (req, res) => {
  currentUser = {};
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log(urlDatabase[shortURL]);
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const newLongURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  let user_id = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  while (user_id.length < 6) {
    user_id += letters.charAt(Math.floor(Math.random() * 62));
  }
  return user_id;
};

const emailLookupHelper = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    } else {
      return false;
    }
  }
};

const urlsForUser = function(id) {
  let currentUserURLS = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      currentUserURLS[url] = {};
      currentUserURLS[url].longURL = urlDatabase[url].longURL;
      currentUserURLS[url].userID = id;
    }
  }
  return currentUserURLS;
};
