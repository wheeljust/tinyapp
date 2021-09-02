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

module.exports = { getUserByEmail };