const express = require("express");
const app = express();
const CookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const { response } = require("express");
app.use(bodyParser.urlencoded({extended: true}));
app.use(CookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/new", (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  console.log(username);
  res.cookie('username', username);
  res.redirect('/urls')
})

app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies['username'], 
    urls: urlDatabase 
  };
  
  // res.cookie(username, 'true);
  // // res.redirect('/urls/login')
  // if (req.cookies.loggedin == true) {
  //   response = "you are logged in 8)";
  // } res.send(response);
  res.render('urls_index', templateVars);
})

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {shortURL: shortURL, longURL : longURL, username: req.cookies['username'],};
  // console.log(templateVars);
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  console.log(longURL);
  res.redirect(longURL);
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
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  let id = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  while (id.length < 6) {
    id += letters.charAt(Math.floor(Math.random() * 62));
  }
  return id;
};

