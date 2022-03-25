const express = require('express');
const app = express();

const PORT = 3005;
const D = new Date();

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
// const {uniqueVisitors} = require('./helper.js');

//////// DATEBASE ////////
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    date: D.toDateString(),
    visitorIds: [],
    traffic: 0
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    date: D.toDateString(),
    visitorIds: [],
    traffic: 0
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
    userID, 
    date: D.toDateString(),
    visitorIds: [],
    traffic: 0
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
  const password = req.body.password;

  if (req.body.username.trim() === '' || req.body.password.trim() === '') {
    return res.status(400).send('Error: no username/password inputed');
  }

  if (getUserByEmail(req.body.username, users)) {
    return res.status(400).send('Error: user already exists');
  }
  
  // SYNCHRONUS HASH 
    const hashedPassword = bcrypt.hashSync(password, 10);

  // ASYNC HASH USING PROMISES (for future reference)
  // const hashedPassword = bcrypt.genSalt(10)
  //   .then(salt => {
  //     console.log('salt promise:', salt)
  //     return bcrypt.hash(password, salt)
  //   })
  //   .then(hash => {
  //     console.log('hash promise', hash)
  //   })
  //   .then()
  //   .catch(error => console.log(error))

  users[userRandomID] = {
    id: userRandomID,
    email: req.body.username,
    password: hashedPassword
  };

  req.session.user_id = userRandomID;
  res.redirect('/urls');
});

//SHORT URL PAGE
app.get('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const shortURLDataBase = urlDatabase[shortURL];

  // authentication and error response
  if (!shortURLDataBase) {
    return res.status(400).send('Error: URL not in the Database');
  }

  if (!userID) {
    return res.status(400).send('Error: User not logged in');
  }

  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(400).send('No Permission to access URL');
  }
  
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
  const urlObj = urlDatabase[shortURL];
  const visitorId = req.session.visitor_id
  
  if (!urlObj) {
    return res.status(400).send('Error: URL not in the Database');
  }

  //calculating traffic per click
    urlDatabase[shortURL]['traffic'] +=1

  //creating visitor cookie to track unique visitor
  if(visitorId) {
    if (!urlObj.visitorIds.includes(visitorId)) {
      urlDatabase[shortURL]['visitorIds'].push(visitorId)
    }
   ;
  } else {
    req.session.visitor_id = generateRandomString();
    urlDatabase[shortURL]['visitorIds'].push(req.session.visitor_id);
  } 
  
  const longURL = urlObj.longURL;
  res.redirect(longURL);
});


// DELETING URLS
app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;

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
