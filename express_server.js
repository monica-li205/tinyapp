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
const users = {
  "userRandomuser_id": {
    user_id: "userRandomuser_id", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2Randomuser_id": {
    user_id: "user2Randomuser_id", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/new", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies['user_id'], 
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    users:users,
    urls: urlDatabase,
    user_id: req.cookies['user_id'],
  };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies['user_id'],
  };
  res.render('urls_register', templateVars);
})

app.post('/register', (req, res) => {
  let id = generateRandomString();
  users[id] = {};
  users[id]['user_id'] = id;
  users[id]['email'] = req.body.email;
  users[id]['password'] = req.body.password;

  if (!req.body.email || !req.body.password) {
    return res.sendStatus(400);

  } else if (!emailLookupHelper(req.body.email)) {
    return res.sendStatus(400);

  } else {
    res.cookie('user_id', id);
    console.log(users);
    res.redirect('/urls');  
  }
})

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

// app.post('/login', (req, res) => {
//   const use = req.body.use;
//   console.log(use);
//   res.cookie('use', use);
//   res.redirect('/urls')
// })

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL: shortURL, 
    longURL : longURL, 
    user: user,
  };
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
      return false;
    }
  }
  return true;
};
