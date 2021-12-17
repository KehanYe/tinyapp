const express = require('express');
const app = express();

const PORT = 3005;

///////// MIDDLEWARE /////////
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["fu"]
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


///////// PASSWORD ENCRYPTION /////////
const bcrypt = require('bcryptjs');


// set view engine to ejs
app.set('view engine', 'ejs');


///////// HELEPER FUNCTIONS /////////
const {getUserByEmail} = require('./helper.js');
const {generateRandomString} = require('./helper.js');
const {urlsforUserID} = require('./helper.js');

//////// DATEBASE ////////
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
	  aJ48lW: {
    id: 'aJ48lW',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};


// ROOT PAGE
app.get('/', (req, res) => {
  userID = req.session.user_id;
  if (!userID) {
    return res.redirect(`/login/`);
  } else {
    return res.redirect(`/urls/`);
  }
  
});

// HOME PAGE - URLS LISTED
app.get('/urls', (req, res) => {
  userID = req.session.user_id;
  if (!userID) {
    return res.redirect(`/login/`);
  }

  const templateVars = { urls: urlsforUserID(userID, urlDatabase), user: users[req.session.user_id]};
  res.render('urls_index', templateVars);
});

//  NEW URL PAGE
app.get('/urls/new', (req, res) => {
  userID = req.session.user_id;
  if (!userID) {
    return res.redirect(`/login/`);
  }
  
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_new', templateVars);
});

// ADDING NEW URL submit HANDLER
app.post('/urls', (req, res) => {

  userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }

  let shortURL = generateRandomString();
  
  urlDatabase[shortURL] =  {
    longURL: req.body.longURL,
    userID //bc key = value, shorthand works here
  },
	
  res.redirect(`/urls/${shortURL}`);
});

// UPDATING URL handler
app.post('/urls/:id', (req, res) => {

  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  userID = req.session["user_id"];
  if (!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status(403).send('Error: Cannot Update. URL belongs to someone else');
  }
	
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect(`/urls/`);
});

//REGISTER PAGE
app.get('/register', (req, res) => {

  const templateVars = { user: users[req.session.user_id] };
  res.render('register', templateVars);
});

//REGISTER use SUBMIT handler
app.post('/register', (req, res) => {
  let userRandomID = generateRandomString();

  if (req.body.username.trim() === '' || req.body.password.trim() === '') {
    return res.status(400).send('Error: no username/password inputed');
  }

  if (getUserByEmail(req.body.username, users)) {
    return res.status(400).send('Error: user already exists');
  }

  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userRandomID] = {
    id: userRandomID,
    email: req.body.username,
    password: hashedPassword
  };

  req.session.user_id = userRandomID;
  res.redirect('/urls');
});

//SHORT URL PAGE
app.get('/urls/:shortURL', (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }
  
  let shortURL = req.params.shortURL;
  
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id]
  };
  //longURL is accessing the value of the key in URLDatabse object(url parameters is key)
  res.render('urls_show', templateVars);
});

//SHORT URL redirect to LONGURL (no login needed)
app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  const shortURLDataBase = urlDatabase[shortURL];
  
  if (!shortURLDataBase) {
    return res.status(400).send('Error: URL not in the Database');
  }

  if (!userID) {
    return res.status(400).send('Error: URL not in the Database');
  }
  
  const longURL = shortURLDataBase.longURL;
  res.redirect(longURL);
});


// DELETING URLS
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;

  if (!req.session) {
    return res.status(401).send('Error: Cannot Delete. Not logged in.');
  }

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status(403).send('Error: Cannot Delete. URL belongs to someone else');
  }
  
  delete urlDatabase[shortURL];

  res.redirect(`/urls/`);
});

// LOGIN PAGE
app.get('/login', (req, res) => {
  let userID = req.session.user_id;
  if (userID) {
    return res.redirect(`/urls/`);
  }
  
  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

// LOGIN use SUBMIT handler
app.post('/login', (req, res) => {
  const userID = getUserByEmail(req.body.username, users);

  if (userID) {
    if (bcrypt.compareSync(req.body.password, userID.password)) {
      req.session.user_id = userID.id;
      res.redirect(`/urls/`);
    } else {
      res.status(403).send("Error: Wrong Password");
      return;
    }
  } else {
    res.status(403).send("Email not Found");
    return;
  }
  
});

// LOGOUT SUBMIT handler
app.post('/logout', (req, res) => {
	
  req.session = null;
  res.redirect(`/urls/`);
});

// TEST LINKS
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase[req.session["user_id"]]);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Welcome <b>Player 1!</b></body></html>\n');
});

/// Server Connection Response
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
