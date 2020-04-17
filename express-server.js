const express = require('express');
var methodOverride = require('method-override');
const app = express();
const PORT = 3001;

app.use(methodOverride('X-HTTP-Method-Override'));

// Handles and sets cookie encryption
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));

// Formats form submissions
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// Import routers
const authenticationRouter = require('./routes/authentication');
const urlRouter = require('./routes/url');

// DATABASE
const urlDatabase = {
  // example url
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'qd32ds'}
};

const users = {
  // example user
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};
app.set('view engine', 'ejs');

// Set-up routers
app.use(authenticationRouter(urlDatabase, users));
app.use('/urls',urlRouter(urlDatabase, users));

// Independent router. Didn't assign it to its own module
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Open an express connection
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});