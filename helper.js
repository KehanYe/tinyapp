const getUserByEmail = (email, database) => {
  for (const userID in database) {
    // console.log(user)
    if (database[userID].email === email) {
      // console.log(users[user])
      return database[userID];
    }
  }
};



module.exports = {getUserByEmail}