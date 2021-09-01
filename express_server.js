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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

/** REGISTER & LOGIN/OUT Handlers */

// READ register page
app.get("/register", (req, res) => {
  const error = {
    msg: null,
  };
  res.render("register", { error });
});

// POST for a new user sign up
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const error = {
    msg: null,
  };
  
  // Check if no entry in the fields provided
  if (!email || !password) {
    res.statusCode = 400;
    error.msg = 'Please enter a valid email and password';
    return res.render("register", { error });
  }
  
  // Check for the user in the database
  if (getUserByEmail(email)) {
    res.statusCode = 400;
    error.msg = 'This account already exists, please login using your existing email and password';
    return res.render("login", { error });
  }

  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// Read login page
app.get("/login", (req, res) => {
  const error = {
    msg: null,
  };
  res.render("login", { error });
});

// POST for login feature
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  const error = {
    msg: null,
  };

  // Check if no entry in the fields provided
  if (!email || !password) {
    res.statusCode = 400;
    error.msg = 'Please enter a valid email and password';
    return res.render("login", { error });
  }
  
  // No user found - user would be null
  if (!user) {
    res.statusCode = 403;
    error.msg = 'Email not found, please create a new account';
    return res.render("register", { error });
  }

  // user found but passwords don't match
  if (user.password !== password) {
    error.msg = 'The password you entered is invalid, please try again.';
    res.statusCode = 403;
    return res.render("login", { error });
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// POST to logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


/** URLs INDEX Page */

// READ: go to page with URL database table
app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = {
    user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// POST new shortURL to urlDatabase, redirect to urls_show view with the new shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


/** URLs NEW */

// READ page where user can create a new shortURL
app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});


/** URLs DETAILS */

// READ info for one of the shortURLs
app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = {
    user,
    shortURL,
    longURL
  };
  res.render("urls_show", templateVars);
});

// READ: Redirects using the shortURL to the longURL webpage
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // To prevent attempting multiple redirects, set staus code to 404 Not found when the shortURL doesn't exist in urlDatabase
  if (!longURL) {
    res.statusCode = 404;  //res.status(404).send("URL is not defined, page not found") and a return?
    res.end();
  }
  res.redirect(longURL);
});

// UPDATE feature: POST a new long URL to the database
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

// DELETE feature: Deletes a URL from the database via Delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});


/** Server to listen on default port */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});