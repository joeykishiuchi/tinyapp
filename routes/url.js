const express = require('express');
var methodOverride = require('method-override');

// Import helper functions
const { generateRandomString } = require('../helpers');

const urlRouter = (urlDatabase, users) => {
  const router = express.Router();
  router.use(methodOverride('_method'));

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
      urlDatabase[shortURL] = { 
        longURL: req.body.longURL, 
        userID: req.session.user_id, 
        visitCount: 0, 
        uniqueVisits: [],
        visitorLog: []
      };
      res.redirect(`/urls/${shortURL}`);
    } else {
      const templateVars = {
        user: users[req.session.user_id],
        error: 'Please enter a URL you\'d like to shorten!'
      };
      res.render('urls_new',templateVars);
    }
  });
  
  
  router.delete('/:shortURL/delete',(req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  });
  
  router.get('/:shortURL',(req, res) => {
    // Checks that the shortened URL exists in the database
    if (urlDatabase[req.params.shortURL]) {
      urlDatabase[req.params.shortURL].visitCount++;
      const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        visits: urlDatabase[req.params.shortURL].visitCount,
        uniqueVisits: urlDatabase[req.params.shortURL].uniqueVisits,
        visitorLog: urlDatabase[req.params.shortURL].visitorLog,
        user: users[req.session.user_id],
        editPermission: true
      };
      if (templateVars.user) {
        const date = new Date();
        urlDatabase[req.params.shortURL].visitorLog.push(`${templateVars.user.id} ===> ${date}`);
        if (urlDatabase[req.params.shortURL].userID === templateVars.user.id) { 
          res.render("urls_show", templateVars);
        } else {
          if (!templateVars.uniqueVisits.includes(templateVars.user.id)) {
            urlDatabase[req.params.shortURL].uniqueVisits.push(templateVars.user.id);
          }
          templateVars.editPermission = false;
          res.render("urls_show", templateVars);
        }
      } else {
        templateVars.editPermission = false;
          res.render("urls_show", templateVars);
      }
    } else {
      res.status(404).send('Sorry, that doesn\'t seem to be a valid URL');
    }
});
  
  router.put('/:shortURL',(req, res) => {
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