//creates random ID when users register
const generateRandomString = function() {
  let user_id = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  while (user_id.length < 6) {
    user_id += letters.charAt(Math.floor(Math.random() * 62));
  }
  return user_id;
};

//checks and returns a username if their email is already in the database
const getUserByEmail = function(email, users) {
  let username = '';
  for (let user in users) {
    if (users[user].email === email) {
      username = users[user].user_id;
    }
  }
  if (username === '') {
    username = undefined;
  }
  return username;
};

//creates a database of the current user's URLs
const urlsForUser = function(id, urlDatabase) {
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

module.exports = {generateRandomString, getUserByEmail, urlsForUser};