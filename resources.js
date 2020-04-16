// Generates a 6 character string that acts as a shortURL
const generateRandomString = function() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvqwxyz0123456789";
  let randomString = [];
  for (let i = 0; i < 6; i++) {
    const randomChar = characters.charAt(Math.floor(Math.random() * (characters.length + 1)));
    randomString.push(randomChar);
  }
  return randomString.join("");
};
// Compares given emai; to users database, returns userID or empty string
const getUserByEmail = function(users, email) {
  for (const user in users) {
    if (users[user].email ===email) {
      return user;
    }
  }
  return '';
};

module.exports = { generateRandomString, getUserByEmail };