// Set up packages and modules
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
// Note - body parser deprecated, could just use this line:
// app.use(urlencoded({extended: false});

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.static("public"));

app.set("view engine", "ejs");

// Database variables
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", id: "aJ481W" },
  "9sm5xK": {longURL: "http://www.google.com", id: "aJ481W" }
};

const users = {

};

/**
 * generateRandomString
 * @returns random string 6 characters long
 */
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

/**
 * getUserByEmail function
 * @param {a users email address from the entry form} subEmail
 * @returns the user credentials as an object if their email is found in the database
 */
const getUserByEmail = (subEmail) => {
  if (users.length === 0) return null;

  for (const id in users) {
    if (subEmail === users[id].email) {
      return users[id];
    }
  }
  // No match in the database, return null meaning credentials do not exist
  return null;
};

/**
 * returns a restricted object of URLs from the database that only the logged in user can access
 * @param {id of the user who is logged in} id 
 */
const urlsForUser = (id) => {
  const accessList = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].id === id) {
      accessList.url = urlDatabase[url];
    }
  }
  return accessList;
};

/** REGISTER & LOGIN/OUT Handlers */

// READ: register page
app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const error = { msg: null };
  const templateVars = {
    user,
    error
  }
  res.render("register", templateVars);
});

// POST: for a new user sign up
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const error = { msg: null };
  const id = generateRandomString();
  
  // initate the user as null for error handling, if all filters pass then the user will be put in database
  const user = null;  
  
  // Check if no entry in the fields provided
  if (!email || !password) {
    res.statusCode = 400;
    error.msg = 'Please enter a valid email and password';
    return res.render("register", { user, error });
  }
  
  // Check for the user in the database
  if (getUserByEmail(email)) {
    res.statusCode = 400;
    error.msg = 'This account already exists, please login using your existing email and password';
    return res.render("login", { user, error });
  }

  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// READ: login page
app.get("/login", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const error = { msg: null };
  const templateVars = {
    user,
    error
  }
  res.render("login", templateVars);
});

// POST: for login feature
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = getUserByEmail(email);
  const error = {
    msg: null,
  };

  // Check if no entry in the fields provided
  if (!email || !password) {
    res.statusCode = 400;
    error.msg = 'Please enter a valid email and password';
    return res.render("login", { user, error });
  }
  
  // No user found - user would be null
  if (!user) {
    res.statusCode = 403;
    error.msg = 'Email not found, please create a new account';
    return res.render("register", { user, error });
  }

  // user found but passwords don't match
  if (user.password !== password) {
    error.msg = 'The password you entered is invalid, please try again.';
    user = null;
    res.statusCode = 403;
    return res.render("login", { user, error });
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// POST: to logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


/** URLs INDEX Page */

// READ: go to page with URL database table
app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const error = { msg: null };
  const templateVars = {
    user,
    urls: urlsForUser(id),
    error
  };

  if (!id) {
    error.msg = "Please log in to view this page"
    return res.render("urls_index", templateVars);
  }

  res.render("urls_index", templateVars);
});

// POST: new shortURL to urlDatabase, redirect to urls_show view with the new shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const id = req.cookies["user_id"];
  urlDatabase[shortURL] = {
    longURL,
    id
  };
  res.redirect(`/urls/${shortURL}`);
});


/** URLs NEW */

// READ: page where user can create a new shortURL
app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];

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
  const id = req.cookies["user_id"];
  const user = users[id];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    user,
    shortURL,
    longURL
  };
  res.render("urls_show", templateVars);
});

// READ: Redirects using the shortURL to the longURL webpage
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  // To prevent attempting multiple redirects, set staus code to 404 Not found when the shortURL doesn't exist in urlDatabase
  if (!longURL) {
    res.statusCode = 404;  //res.status(404).send("URL is not defined, page not found") and a return?
    res.end();
  }
  res.redirect(longURL);
});

// UPDATE/EDIT feature - POST: a new long URL to the database
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

// DELETE feature - DELETE: a URL from the database via Delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});


/** Server to listen on default port */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});