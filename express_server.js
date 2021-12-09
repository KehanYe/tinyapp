const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
const { application } = require('express');
app.use(cookieParser())


const PORT = 3005;

// set view engine to ejs
app.set("view engine", "ejs");

////
////
//// HELEPER FUNCTIONS & DATABASE
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
characters.length));
  }
  return result;
}

const getUserByEmail = (email) => {
  for (let user in users) {
    if(users[user].email === email) {
    return true
    } 
  }
  return false
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
}

////
////
////

// ROOT PAGE
app.get("/", (req, res) => {
  res.send("Hello Player 1!");
});

// HOME PAGE
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies["user"]]};
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user"]]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);

  let shortURL = generateRandomString();
  const longURL = req.body.longURL
  urlDatabase[shortURL] = longURL;
  
  // res.redirect("/urls");
  res.redirect(`/urls/${shortURL}`)
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  // console.log("good morning mr. west")
  res.cookie('username', req.body.username)

  res.redirect(`/urls/`)
});

app.post("/logout", (req, res) => {
  // console.log("good morning mr. west")
  res.clearCookie('user')

  res.redirect(`/urls/`)
});

//REGISTER PAGE
app.get('/register', (req, res) => {
  const templateVars = {user: users[req.cookies["user"]]}
  res.render('register', templateVars)
})

//register use SUBMIT handler
app.post('/register', (req, res) => {
  let userRandomID  = generateRandomString();
  
  if (req.body.username.trim() === "" || req.body.password.trim() === ""){
    return res.status(400).send("Error: no username/password inputed")
  }

  if (getUserByEmail(req.body.username)) {
    return res.status(400).send("Error: user already exsits")
  }
  
  users[userRandomID] ={
    id: userRandomID,
    email: req.body.username,
    password: req.body.password
  }

  // console.log("user list", JSON.stringify(users))
  res.cookie("user", userRandomID)
  res.redirect("/urls")
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user"]]};
  //longURL is accessing the value of the key in URLDatabse object(url parameters is key)
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log("good morning mr. west");

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  
  res.redirect(`/urls/`)
});

// LOGIN PAGE
app.get('/login', (req, res) => {
  const templateVars = {user: users[req.cookies["user"]]}
  res.render('register', templateVars)
})

// LOGIN use SUBMIT handler
app.post("/login", (req, res) => {
  // console.log("good morning mr. west")
  res.cookie('username', req.body.username)

  res.redirect(`/urls/`)
});

app.post("/urls/:id", (req, res) => {
  // console.log("good morning mr. Kanye West");
    // psuedo code: 
    // 1. take the id referenced in path
    // 2. go to urlDatabse and change the value associated with ID to new longurl

    const shortURL = req.params.id
    // console.log(shortURL)
    
    const newLongURL = req.body.longURL
    urlDatabase[shortURL] = newLongURL;
    // console.log(urlDatabase)
    res.redirect(`/urls/`)
})

app.get("/")

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Welcome <b>Player 1!</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});