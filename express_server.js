const express = require('express')
const app = express()
const PORT = 3005

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello Player 1!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});