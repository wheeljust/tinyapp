const { assert } = require('chai');
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  getURLbyShortLink,
  getTimestamp
} = require('../helpers');

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

const testUrlDatabase = {
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

describe('getURLbyShortLink tests', () => {

  it('should return only a single url object matching the provided short link (url)', () => {
    const actual = getURLbyShortLink("b2xVn2", testUrlDatabase);
    const expected = {
      shortURL: "b2xVn2",
      longURL: "http://www.lighthouselabs.ca",
      id: "userRandomID",
      totalVisits: 0,
      uniqueVisits: 0,
      visitHistory: []
    };

    assert.deepEqual(actual, expected);
  });

  it('should return undefined if no matching short url exists in the database', () => {
    const actual = getURLbyShortLink("abc123", testUrlDatabase);

    assert.isUndefined(actual);
  });

});

describe('urlsForUser tests', () => {

  it('should return only the urls for the user id provided', () => {
    const actual = urlsForUser("userRandomID", testUrlDatabase);
    const expected = {
      "b2xVn2": {
        shortURL: "b2xVn2",
        longURL: "http://www.lighthouselabs.ca",
        id: "userRandomID",
        totalVisits: 0,
        uniqueVisits: 0,
        visitHistory: []
      }
    };

    assert.deepEqual(actual, expected);
  });

  it('should return empty object if there are no urls created by the given user id', () => {
    const actual = urlsForUser("user3RandomID", testUrlDatabase);
    const expected = {};

    assert.deepEqual(actual, expected);
  });

  it('should return empty object if there are no urls in the database to iterate on', () => {
    const actual = urlsForUser("userRandomID", {});
    const expected = {};

    assert.deepEqual(actual, expected);
  });

  it('should return undefined if no user id provided', () => {
    const actual = getUserByEmail("", testUrlDatabase);

    assert.isUndefined(actual);
  });
  
});

describe('generateRandomString test', () => {

  it("should return a random string with length of 6", () => {
    const rdmStringLength = generateRandomString().length;
    assert.strictEqual(rdmStringLength, 6);
  });

});

describe('getTimestamp test', () => {

  it("should return the current timestamp in correct format", () => {
    const currentTime = new Date(Date.now()).toLocaleString();
    const actual = `${currentTime} UTC`;
    assert.strictEqual(actual, getTimestamp());
  });

});