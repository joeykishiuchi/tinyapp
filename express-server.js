const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { generateRandomString } = require('./generateRandomString');
// Encodes buffer from POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

// Data

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};

// POST Requests

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.redirect('/register')
  } else {
    for (let user in users) {
      if (users[user].email === email) {
        return res.status(400).send('Email already Exists!')
      }
    }
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: password
    };
    res.cookie('user_id', newUserID);
    console.log(users);
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL/delete',(req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit',(req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/urls/:shortURL',(req, res) => {
  if (!req.body.newURL) {
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// GET REQUESTS

app.get('/',(req, res) => {
  res.render();
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[res.cookie.user_id]
  };
  res.render('registration',templateVars);
});

app.get('/urls',(req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[res.cookie.user_id]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new',(req, res) => {
  const templateVars = {
    user: users[res.cookie.user_id]
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL',(req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[res.cookie.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Open a express connection

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});