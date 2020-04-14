const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const { generateRandomString } = require('./generateRandomString');

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

app.post('/urls', (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  const templateVars = {shortURL:generateRandomString(), longURL: req.body.longURL};
  res.render('urls_show', templateVars);
});

app.get('/',(req, res) => {
  res.render();
});

app.get('/urls',(req, res) => {
  const templateVars = {urls: urlDatabase}
  res.render('urls_index', templateVars);
});

app.get('/urls/new',(req, res) => {
  res.render('urls_new');
});

app.get('/u/:shortURL',(req, res) => {
  const longURL = ;
  res.redirect(longURL);
});

app.get('/urls/:shortURL',(req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});