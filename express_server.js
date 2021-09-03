// Set up express
const express = require("express");
const app = express();
const PORT = 8080;

// Middleware requirements
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

const bcrypt = require('bcrypt');

// Required helper functions
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  getURLbyShortLink,
  getTimestamp
} = require('./helpers');

// static is used to render the image on the register and login pages
app.use(express.static("public"));
app.set("view engine", "ejs");

// Database variables
const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    id: "userRandomID",
    totalVisits: 0,
    uniqueVisits: 0,
    visitHistory: []
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    id: "user2RandomID",
    totalVisits: 0,
    uniqueVisits: 0,
    visitHistory: []
  }
};

const users = {

};


/** REGISTER & LOGIN/OUT Handlers */

// READ: always redirect home page to login if no cookie set, otherwise redirect to MyURLs page if logged in
app.get("/", (req, res) => {
  const id = req.session.userID;
  if (id) return res.redirect("/urls");
  res.redirect("/login");
});

// READ: GET register page
app.get("/register", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const error = { msg: null };
  const templateVars = {
    user,
    error
  };
  res.render("register", templateVars);
});

// POST: for a new user to register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const error = { msg: null };
  
  // initate the user as null for error handling, if all filters pass then user will added to database at the end
  const user = null;
  
  // Check if no entry in the fields provided
  if (!email || !password) {
    res.statusCode = 400;
    error.msg = 'Please enter a valid email and password';
    return res.render("register", { user, error });
  }
  
  // Check for the user already in the database
  if (getUserByEmail(email, users)) {
    res.statusCode = 400;
    error.msg = 'This account already exists, please login using your existing email and password';
    return res.render("login", { user, error });
  }

  users[id] = {
    id,
    email,
    password
  };
  req.session.userID = id;
  res.redirect("/urls");
});

// READ: GET login page
app.get("/login", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const error = { msg: null };
  const templateVars = {
    user,
    error
  };
  res.render("login", templateVars);
});

// POST: for login feature
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = getUserByEmail(email, users);
  const error = {
    msg: null,
  };

  // Check if no entry in the forms provided
  if (!email || !password) {
    res.statusCode = 400;
    error.msg = 'Please enter a valid email and password';
    return res.render("login", { user, error });
  }
  
  // If no user found, then no account exists and the user needs to register
  if (!user) {
    res.statusCode = 403;
    error.msg = 'Email not found, please create a new account';
    return res.render("register", { user, error });
  }

  // Check if the stored hash of password does not match what was entered in the login form
  if (!bcrypt.compareSync(password, user.password)) {
    user = null; // assign null to prvent the header from populating if the password is incorrect
    error.msg = 'The password you entered is invalid, please try again.';
    res.statusCode = 403;
    return res.render("login", { user, error });
  }

  req.session.userID = user.id;
  res.redirect("/urls");
});

// POST: to logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


/** URLs INDEX Page */

// READ: go to page with URL database table
app.get("/urls", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const error = { msg: null };
  const templateVars = {
    user,
    urls: urlsForUser(id, urlDatabase),
    error
  };

  if (!id) {
    error.msg = "Please register or login to view this page";
    return res.render("urls_index", templateVars);
  }

  res.render("urls_index", templateVars);
});

// POST: new shortURL to urlDatabase, redirect to urls_show view with the new shortURL
app.post("/urls", (req, res) => {
  const id = req.session.userID;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    shortURL,
    longURL,
    id,
    totalVisits: 0,
    uniqueVisits: 0,
    visitHistory: []
  };
  res.redirect(`/urls/${shortURL}`);
});


/** URLs NEW */

// READ: page where user can create a new shortURL
app.get("/urls/new", (req, res) => {
  const id = req.session.userID;

  if (!id) {
    return res.redirect("/login");
  }

  const user = users[id];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});


/** URLs DETAILS */

// READ: info for one of the shortURLs
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const error = { msg: null };
  const url = getURLbyShortLink(req.params.shortURL, urlDatabase);
  
  if (!url) {
    return res.status(404).send("URL is not defined, page not found");
  }

  // If the first filter passes then shortURL exists in database, then pass full url details to tamplateVars
  const templateVars = {
    user,
    url,
    error
  };

  // Permissions check that the session userID matches the URL creator, otherwise no permissions allowed
  if (url.id !== id) {
    error.msg = "Your user permissions do not allow you to access this page";
    return res.render("urls_show", templateVars);
  }

  res.render("urls_show", templateVars);
});

// READ: Redirects using the shortURL to the longURL webpage
app.get("/u/:shortURL", (req, res) => {
  const url = getURLbyShortLink(req.params.shortURL, urlDatabase);
  const visitorCookie = req.session.activeVisitor;
  if (!url) return res.status(404).send("URL is not defined, page not found");

  // Check if this is a new visitor accessing the shortURL - would be no visitor cookie existing if it is a new visitor
  if (!visitorCookie) {
    req.session.activeVisitor = {
      visitorID: generateRandomString(),
      shortURLs: [url.shortURL]
    };
    urlDatabase[url.shortURL].uniqueVisits += 1;
  }

  // Check if the user has not visited this shortURL yet in the current active cookie session
  if (visitorCookie) {
    if (visitorCookie.shortURLs.filter(x => x === url.shortURL).length === 0) {
      req.session.activeVisitor.shortURLs.push(url.shortURL);
      urlDatabase[url.shortURL].uniqueVisits += 1;
    }
  }
  
  // increment total visits every time the path is accessed
  urlDatabase[url.shortURL].totalVisits += 1;

  // Record the timestamp and visitorID in the visitsHistory of this url, use unshift to add elements in order of most recent visit
  urlDatabase[url.shortURL].visitHistory.unshift({
    visitorID: req.session.activeVisitor.visitorID,
    timestamp: getTimestamp()
  });
  
  res.redirect(url.longURL);
});

// UPDATE feature - POST: a new longURL to the database for an existing shortURL
app.post("/urls/:id", (req, res) => {
  const id = req.session.userID;
  const url = getURLbyShortLink(req.params.id, urlDatabase);

  if (url.id !== id) {
    return res.status(401).send("Unauthorized Permissions - Request not complete");
  }

  urlDatabase[url.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

// DELETE feature - DELETE: a URL from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.userID;
  const url = getURLbyShortLink(req.params.shortURL, urlDatabase);
  
  if (url.id !== id) {
    return res.status(401).send("Unauthorized Permissions - Request not complete");
  }

  delete urlDatabase[url.shortURL];
  res.redirect(`/urls`);
});


/** Server to listen on default port */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});