// Set up packages and modules
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

// Database holder for URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Function to generates a random set of 6 characters for the shortURL
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

/**
 * Express route handlers below
 * */

/** GET (READ) ROUTES */

// Route handler for registration form
app.get("/register", (req, res) => {
  res.render("register");
});

// Route handler for HTML form to where user can post a new URL to shorten
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

// Route handler to get to the URL database table
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// Route handler to get only the info for one of the shortURLs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// Route handler for clicking on the shortURL anchor, redirects to the longURL webpage
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // To prevent attempting multiple redirects, set staus code to 404 Not found when the shortURL doesn't exist in urlDatabase
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

// Delete feature: Deletes a URL from the database via Delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

// Edit feature: Updates a long URL in the database
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

// Route for login feature
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

// Route for logout feature
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


// Set up to listen on default port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});