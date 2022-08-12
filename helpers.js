const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const urlsForUser = function(userId, urlDatabase) {
  let userURLs = {};
  for (let randomUrl in urlDatabase) {
    if (urlDatabase[randomUrl].userID === userId) {
      userURLs[randomUrl] = urlDatabase[randomUrl];
    }
  }
  return userURLs;
};

const getUserByEmail = (email, users) => { // function to loop through userdatabase
  for (let id in users) {
    if (users[id]["email"] === email) {
      return users[id];
    }
  }
  return null;
}

module.exports = { generateRandomString, urlsForUser, getUserByEmail }