const express = require('express')

// Import helper functions
const { generateRandomString } = require('../helpers');

const urlRouter = (urlDatabase, users) => {
  const router = express.Router();

  router.get('/',(req, res) => {
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
  
  router.get('/new',(req, res) => {
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
  
  router.post('/new', (req, res) => {
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
  
  
  router.post('/:shortURL/delete',(req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  });
  
  router.get('/:shortURL',(req, res) => {
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
  
  router.post('/:shortURL',(req, res) => {
    if (!req.body.newURL) {
      res.redirect(`/urls/${req.params.shortURL}`);
    } else {
      urlDatabase[req.params.shortURL].longURL = req.body.newURL;
      res.redirect(`/urls/${req.params.shortURL}`);
    }
  });

  return router
};

module.exports = urlRouter;