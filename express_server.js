const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser())


const PORT = 3005;

// set view engine to ejs
app.set("view engine", "ejs");

////
////
//// HELEPER FUNCTIONS & DATABASE
let generateRandomString = () => {
 const result = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
 return result
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
////
////
////

app.get("/", (req, res) => {
  res.send("Hello Player 1!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
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
  res.clearCookie('username')

  res.redirect(`/urls/`)
});

//register page
app.get('/register', (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render('register', templateVars)
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  //longURL is accessing the value of the key in URLDatabse object(url parameters is key)
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log("good morning mr. west");

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  
  res.redirect(`/urls/`)
});

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