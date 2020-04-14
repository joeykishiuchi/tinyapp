// Generates a 6 character string that acts as a shortURL
const generateRandomString = function() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvqwxyz0123456789";
  let randomString = [];
  for (let i = 0; i < 6; i++) {
    const randomChar = characters.charAt(Math.floor(Math.random() * (characters.length + 1)))
    randomString.push(randomChar);
  }
  return randomString.join("");
};

module.exports = { generateRandomString };