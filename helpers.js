/**
 * getUserByEmail function
 * @param {a users email address from the entry form} email
 * @param {the database to iterrate on} databse
 * @returns the user credentials as an object if their email is found in the database
 */

const getUserByEmail = (email, database) => {
  if (database.length === 0) return undefined;

  for (const userID in database) {
    if (email === database[userID].email) {
      return database[userID];
    }
  }

  // No match in the database, return undefined meaning credentials do not exist
  return undefined;
};

/**
 * generateRandomString
 * @returns random string 6 characters long
 */
 const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

/**
 * returns a restricted object of URLs from the database that only the logged in user can access
 * @param {id of the user who is logged in} id
 */
const urlsForUser = (id, urlDatabase) => {
  const accessList = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].id === id) {
      accessList[url] = urlDatabase[url];
    }
  }
  return accessList;
};

/**
 * getURLbyShortLink
 * @param { the shortURL to lookup in the database} shortURL
 * @returns an object containing all of the tracked data for the given shortURL
 */
const getURLbyShortLink = (shortURL, urlDatabase) => {
  if (urlDatabase[shortURL]) return urlDatabase[shortURL];
  return undefined;
};

/**
 * getTimestamp
 * @returns a string containing the current UTC time in a readable format "mm/dd/yyyy, hr:min:sec AM/PM UTC"
 */
const getTimestamp = () => {
  const currentTime = new Date(Date.now()).toLocaleString();
  return `${currentTime} UTC`;
};


module.exports = { 
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  getURLbyShortLink,
  getTimestamp
};