const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase };
  res.render('urls_index', templateVars);
})

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);


  app.get(`/urls/:shortURL`, (req, res) => {
    const templateVars = {shortURL: shortURL, longURL : urlDatabase[shortURL]};
    console.log(templateVars);
    // const longURL = templateVars.longURL;
    res.render('urls_show', templateVars);
  })

  app.get(`/u/:shortURL`, (req, res) => {
    const longURL = urlDatabase[shortURL];
    console.log(longURL);
    res.redirect(`https://${longURL}`);
  });
  // res.redirect(`${urlDatabase[shortURL]}`);
});


// app.get("/urls/:shortURL", (req, res) => {
//   const templateVars = { shortURL: , longURL:   };
//   const longURL = templateVars.longURL
//   res.render('urls_show', templateVars);
// });

;

// app.get("/urls/:shortURL", (req, res) => {
//   const templateVars = { shortURL: "b2xVn2", longURL: "http://www.lighthouselabs.ca"  };
//   const longURL = templateVars.longURL
//   res.render('urls_show', templateVars);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  let id = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  while (id.length < 6) {
    id += letters.charAt(Math.floor(Math.random() * 52));
  }
  return id;
}