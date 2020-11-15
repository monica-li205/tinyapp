const {generateRandomString, getUserByEmail, urlsForUser} = require('./helpers');
const { urlDatabase, users } = require('./sample_databases');
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

app.get("/", (req, res) => {
  //redirects user to home page (if logged in) or to login page (if not logged in) when the head parameter in '/'
  if (currentUser.user_id) {
    res.redirect("/urls");
  } else if (!currentUser.id) {
    res.redirect("/login");
  }
});

app.get("/error", (req, res) => {
  const templateVars = {
    currentUser: currentUser,
    user_id: req.session.user_id,
  };
  res.render("urls_error", templateVars);
});

app.get("/new", (req, res) => {
  const templateVars = {
    currentUser: currentUser,
    user_id: req.session.user_id,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let urls = urlsForUser(currentUser.user_id, urlDatabase);
  const templateVars = {
    currentUser: currentUser,
    urls: urls,
    user_id: req.session.user_id,
  };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    currentUser: currentUser,
    user_id: req.session.user_id,
  };
  // if the user is already logged in, they will be redirected to the homepage
  if (currentUser.user_id) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars);
  }
});

app.get('/login', (req, res) => {
  const templateVars = {
    currentUser: currentUser,
    user_id: req.session.user_id,
  };
  // if the user is already logged in, they will be redirected to the homepage
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
    currentUser: currentUser,
    user_id: req.session.user_id,
  };
  //checks if the user trying to access the shortURL page is the same as the user who created the shortURL
  if (templateVars.user_id === urlDatabase[shortURL].userID) {
    res.render('urls_show', templateVars);
  } else {
    res.redirect('/error');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  //checks if a URL is a valid URL, then checks if the user added https:// to beginning of the URL. If the user did not, it will add the https:// to ensure the link will redirect when clicked on
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
  console.log("USERS:", users);
  // checks if the user left any fields blank or if their email is already in the database
  if (req.body.email === '' || !req.body.password === '' || getUserByEmail(req.body.email, users)) {
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
  console.log("URL DATABASE:", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  let email = req.body.email_login;
  let password = req.body.password_login;
  // checks if email exists in database and if valid, stores their info in the currentUser object
  if (!getUserByEmail(email, users)) {
    res.status(403).send('you do not have permission to perform this action!');
  } else if (email === '' || password === '') {
    res.status(400).send('Please enter a valid email and password');
  } else if (getUserByEmail(email, users)) {
    let user = getUserByEmail(email, users);
    currentUser.user_id = users[user].user_id;
    currentUser.email = users[user].email;
    currentUser.password = users[user].password;
    // checks if the password matches the one stored in the database
    if (bcrypt.compareSync(password, currentUser.password)) {
      console.log("CURRENT USER", currentUser);
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
  // checks if the shortURL belongs to the user trying to delete it
  if (usersURLsArray.includes(shortURL)) {
    console.log("DELETE SHORTURL:", urlDatabase[shortURL]);
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
  console.log("users's URLS:", usersURLsArray);
  // checks if the shortURL belongs to the user trying to edit it
  if (usersURLsArray.includes(shortURL)) {
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect('/urls');
  } else {
    return res.status(403).send('you do not have permission to perform this action!');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

