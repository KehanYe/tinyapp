// ShortURL = id Parameter

const getUserByEmail = (email, database) => {
  for (const userID in database) {
    // console.log(user)
    if (database[userID].email === email) {
      // console.log(users[user])
      return database[userID];
    }
  }
  return undefined;
};

const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const D = new Date();
const urlsforUserID = (id, database) => {
  const userURL = {};
  for (shortURL in database) {
    if (database[shortURL]["userID"] === id) {
      userURL[shortURL] = database[shortURL]
    }
  }
  return userURL;
};

module.exports = {getUserByEmail, generateRandomString, urlsforUserID};