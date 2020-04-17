const express = require('express')
const bcrypt = require('bcrypt');

// Import helper functions
const { generateRandomString, getUserByEmail } = require('../helpers');

const authRouter = (urlDatabase, users) => {
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
  
  router.get('/register', (req, res) => {
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
  
  router.post('/register', (req, res) => {
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
      console.log(req.session.user_id );
      
      res.redirect('/urls');
    }
  });
  
  router.get('/login', (req, res) => {
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
  
  router.post('/login', (req, res) => {
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
        console.log(req.session.user_id );
        res.redirect('/urls');
      }
    }
  });
  
  router.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
  });

  return router
};

module.exports = authRouter;