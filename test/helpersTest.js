const { assert } = require('chai');
const { getUserByEmail } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "a3eDf5": {
    id: "a3eDf5",
    email: "testing@example.com",
    password: "forgotEncryption"
  }
};

describe('getUserByEmail tests', () => {

  it('should return a user with a valid email', () => {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expected = {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    };

    assert.deepEqual(expected, user);
  });

  it('should return undefined if user email is not in the database', () => {
    const user = getUserByEmail("user34@example.com", testUsers);
    const expected = undefined;

    assert.strictEqual(expected, user);
  });

  it('should return undefined if user email is an empty string', () => {
    const user = getUserByEmail("", testUsers);
    const expected = undefined;

    assert.strictEqual(expected, user);
  });

  it('should return undefined if the user database is empty, i.e. no new users created yet', () => {
    const user = getUserByEmail("user2@example.com", {});
    const expected = undefined;

    assert.strictEqual(expected, user);
  });

});
