const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const { generateRandomString } = require('./generateRandomString');
// Encodes buffer from POST
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
// Recieves form input, stores the data and redirects to corresponding path
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`)
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

app.get('/urls/:shortURL',(req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// Open a express connection 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});