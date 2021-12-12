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

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function urlsforUserID(id, database) {
  const userURL = {};
  for (shortURL in database) {
  // console.log("urlDatabase is", urlDatabase)
    if (database[shortURL]["userID"] === id) {
      userURL[shortURL] = {
        longURL: database[shortURL]["longURL"],
        userID: database[shortURL]["userID"]
      };
    }
  }
  return userURL;
}

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
  res.send('Hello Player 1!');
  if (userID) {
    return res.redirect(`/urls/`);
  }
  if (!user) {
    return res.redirect(`/login/`);
  }
});

// HOME PAGE - URLS LISTED
app.get('/urls', (req, res) => {
  userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }

  // console.log("userID of current user", userID)
  // console.log("user URLS pulled from Database", userURL)

  const templateVars = { urls: urlsforUserID(userID, urlDatabase), user: users[req.session.user_id]};
  // console.log("this is template vars", templateVars)
  res.render('urls_index', templateVars);
});

//  NEW URL PAGE
app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_new', templateVars);
});

// ADDING NEW URL submit HANDLER
app.post('/urls', (req, res) => {
  // console.log("testing res.cookie", req.cookies["user_id"])

  userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }

  let shortURL = generateRandomString();
  
  urlDatabase[shortURL] =  {
    longURL: req.body.longURL,
    userID //bc key = value, shorthand works here
  },
	
  // urlDatabase[req.cookies['user_id'][shortURL]] = longURL;
  // console.log("check if URL is in DATABSE", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

// UPDATING URL handler
app.post('/urls/:id', (req, res) => {

  const shortURL = req.params.id;
  // console.log("URL DATABSE CHECK", urlDatabase);
  // console.log("shortURL Check", shortURL);
  const newLongURL = req.body.longURL;

  userID = req.session["user_id"];
  if (!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status(403).send('Error: Cannot Update. URL belongs to someone else');
  }

	
  urlDatabase[shortURL].longURL = newLongURL;
  // console.log("URL DATABSE CHECK once updated", urlDatabase);
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
  // console.log("this is original password", password)
  const hashedPassword = bcrypt.hashSync(password, 10);
  // console.log("this is hash password", hashedPassword)

  users[userRandomID] = {
    id: userRandomID,
    email: req.body.username,
    password: hashedPassword
  };

  // console.log('user list', JSON.stringify(users));
  req.session.user_id = userRandomID;
  console.log("This is cookie when registered", req.session);
  res.redirect('/urls');
});

//SHORT URL PAGE
app.get('/urls/:shortURL', (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }
  
  let shortURL = req.params.shortURL;
  // console.log("checking for SHORTURL", shortURL)
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
  // console.log("longURL is", longURL);
  res.redirect(longURL);
});


// DELETING URLS
app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log("good morning mr. west");
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
  if (userID) {
    return res.redirect(`/urls/`);
  }
  
  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

// LOGIN use SUBMIT handler
app.post('/login', (req, res) => {
  const userID = getUserByEmail(req.body.username, users);
  // console.log("check for userID after using getUser", userID)
  // const loggedUser = users[userID]

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
  // console.log("logout showing");
	
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
