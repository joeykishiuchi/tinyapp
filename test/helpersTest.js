const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

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
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const actual = getUserByEmail(testUsers, "user@example.com");
    const expected = "userRandomID";
    assert.equal(actual ,expected);
  });
  it('should return a undefined with invalid email', function() {
    const actual = getUserByEmail(testUsers, "user3@example.com");
    const expected = undefined;
    assert.equal(actual ,expected);
  });
});