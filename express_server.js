// Set up packages and modules
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// Database holder for URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Temporary location for function that generates a shortURL
function generateRandomString() {
  return Math.random().toString(16).substr(2, 6);
};


/** 
 * Express server functions below for http requests and responses 
 * */


/** GET ROUTES */

app.get("/", (req, res) => {
  res.send("Home Page");
});

// Route handler for HTML form to where user can post a new URL to shorten
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Route handler to get to the URL database table
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Route handler to get only the info for one of the shortURLs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// Route handler for clicking on the shortURL anchor, redirects to the longURL webpage
app.get("/u/:shortURL", (req, res) => {
  const longURL = (urlDatabase[req.params.shortURL]);
  // To prevent attempting multiple redirects, set staus code to 404 Not found when no shortURL in urlDatabase
  if (!longURL) {
    res.statusCode = 404;
    res.end();
  }
  res.redirect(longURL);
});


/** POST ROUTES */

// When a new shortURL is generated, redirect to urls_show view with the new shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Deletes a URL from the database via Delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

// Updates a long URL in the database
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

// route for login feature
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie(username, 'username');
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});