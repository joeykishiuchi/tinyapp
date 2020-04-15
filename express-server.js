const express = require('express');
const app = express();
const PORT = 3001;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { generateRandomString } = require('./generateRandomString');
// Encodes buffer from POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

// Data

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca" },
  "9sm5xK": { longURL: "http://www.google.com" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};
// checks through users for an existing email and returns the iser ID, otherwise returns false;
const checkUser = function(newEmail) {
  for (const user in users) {
    if (users[user].email === newEmail) {
      return user;
    }
  }
  return false;
};

// POST Requests

app.post('/urls/new', (req, res) => {
  if (req.body.longURL) {
    console.log(req.body.longURL)
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/urls/new');
  }
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Please fill in the fields!")
  } else if (checkUser(email)) {
    return res.status(400).send('Email already Exists!')
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: password
    };
    res.cookie('user_id', newUserID);
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
  const { email, password} = req.body;
  if (!checkUser(email)) {
    return res.status(403).send("We don't seem to have an account under that email!");
  } else {
    const userPassword = users[checkUser(email)].password;
    if(userPassword !== password) {
      return res.status(403).send("Incorrect Password!");
    }
    const userId = checkUser(email);
    res.cookie('user_id',userId);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// GET REQUESTS

app.get('/',(req, res) => {
  res.redirect('register');
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('registration',templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('login', templateVars);
});

app.get('/urls',(req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  if (req.cookies.user_id && users[req.cookies.user_id]) {
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/new',(req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  if (req.cookies.user_id && users[req.cookies.user_id]) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:shortURL',(req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id]
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

// Open an express connection

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});