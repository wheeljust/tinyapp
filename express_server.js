// Set up packages and modules
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

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
 * findUser function
 * @param {a users email address from the entry form} subEmail
 * @returns the users credentials as an object if their email is found in the database
 */
const findUser = (subEmail) => {
  if (users.length === 0) return undefined;

  for (const user in users) {
    if (subEmail === users[user].email) {
      return users[user];
    }
  }
  // No match in the database, return undefined credentials meaning no existing user
  return undefined;
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
    res.render("register", { error });
    return;
  }
  
  // Check for the user in the database
  if (findUser(email)) {
    res.statusCode = 400;
    error.msg = 'This account already exists, please login using your existing email and password';
    res.render("login", { error });
    return;
  }

  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password
  };
  res.cookie("user_id", userID);
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
  const credentials = findUser(email);
  const error = {
    msg: null,
  };

  // Check if no entry in the fields provided
  if (!email || !password) {
    res.statusCode = 400;
    error.msg = 'Please enter a valid email and password';
    res.render("login", { error });
    return;
  }
  
  // No credentials found - would be undefined
  if (!credentials) {
    res.statusCode = 403;
    error.msg = 'Email not found, please create a new account';
    res.render("register", { error });
    return;
  }

  // Credentials found but passwords don't match
  if (credentials.password !== password) {
    error.msg = 'The password you entered is invalid, please try again.';
    res.statusCode = 403;
    res.render("login", { error });
    return;
  }

  res.cookie("user_id", credentials.id);
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
  const userID = req.cookies["user_id"];
  const user = users[userID];
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
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});


/** URLs DETAILS */

// READ info for one of the shortURLs
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// READ: Redirects using the shortURL to the longURL webpage
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // To prevent attempting multiple redirects, set staus code to 404 Not found when the shortURL doesn't exist in urlDatabase
  if (!longURL) {
    res.statusCode = 404;
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