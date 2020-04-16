const express = require('express');
const app = express();
const PORT = 3001;

// Handeles password hashing
const bcrypt = require('bcrypt');

// Handles and sets cookie encryption
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));

// Formats form submissions
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// Import helper functions
const { generateRandomString, getUserByEmail } = require('./helpers');

app.set('view engine', 'ejs');

// DATA
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

// ROUTES
app.get('/',(req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (req.session.user_id && users[req.session.user_id]) {
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      errorEmpty: req.query.attemptEmpty ? 'Please fill in the required fields!' : '',
      errorExists: req.query.attemptExists ? 'An account with that email already exists!' : ''
    };
    req.session = null;
    res.render('registration',templateVars);
  }
});

app.post('/register', (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.redirect('/register?attemptEmpty=1');
  } else if (getUserByEmail(users, email)) {
    res.redirect('/register?attemptExists=1');
  } else {
    password = bcrypt.hashSync(password, 10);
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: password
    };
    req.session.user_id = newUserID;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      errorEmpty: req.query.attemptEmpty ? 'Please fill in the required fields!' :  '',
      errorExists: req.query.attemptExists ? 'You\'ve submitted an unknown email or password!' :  ''
    };
    req.session = null;
    res.render('login', templateVars);
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.redirect('/login?attemptEmpty=1');
  } else {
    if (!getUserByEmail(users, email)) {
      res.redirect('/login?attemptExists=1');
    } else {
      const userPassword = users[getUserByEmail(users, email)].password;
      if (!bcrypt.compareSync(password, userPassword)) {
        res.redirect('/login?attemptExists=1');
      }
      const userId = getUserByEmail(users, email);
      req.session.user_id = userId;
      res.redirect('/urls');
    }
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get('/urls',(req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (req.session.user_id && users[req.session.user_id]) {
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/new',(req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    error: ''
  };
  if (req.session.user_id && users[req.session.user_id]) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/new', (req, res) => {
  if (req.body.longURL) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect(`/urls/${shortURL}`);
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      error: 'Please enter a URL you\'d like to shorten!'
    };
    res.render('urls_new',templateVars);
  }
});


app.post('/urls/:shortURL/delete',(req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get('/urls/:shortURL',(req, res) => {
  // Checks that the shortened URL exists in the database and that the url belongs to the logged in user
  if (urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send('Sorry, that doesn\'t seem to be a valid URL');
  }
});

app.post('/urls/:shortURL',(req, res) => {
  if (!req.body.newURL) {
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Open an express connection
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});