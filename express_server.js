const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
const { application } = require('express');
app.use(cookieParser());

const PORT = 3005;

// set view engine to ejs
app.set('view engine', 'ejs');

/////////
/////////
///////// HELEPER FUNCTIONS /////////
function generateRandomString() {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 6; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

app.get('/urls.json', (req, res) => {
	res.json(urlDatabase[req.cookies]);
});

const getUserByEmail = (email) => {
	for (const user in users) {
		// console.log(user)
    if (users[user].email === email) {
			// console.log(users[user])
      return users[user];
		}
	}
};

const getUser = (email) => {
	for (const user in users) {
		// console.log(user)
    if (users[user].email === email) {
			// console.log(users[user])
      return user;
		}
	}
};
/////////
/////////
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
//////////
//////////
//////////

// ROOT PAGE
app.get('/', (req, res) => {
	res.send('Hello Player 1!');
});

// HOME PAGE
app.get('/urls', (req, res) => {
  userID = req.cookies["user_id"]
  if(!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }

  urslforUserID 
  for(key in URLDatabse) {
    if(key === )
  }
  
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']]}
  // console.log("this is template vars", templateVars)
	res.render('urls_index', templateVars);
});

//  NEW URL PAGE
app.get('/urls/new', (req, res) => {
	const templateVars = { user: users[req.cookies['user_id']] };
	res.render('urls_new', templateVars);
});

// ADDING NEW URL submit HANDLER
app.post('/urls', (req, res) => {
  // console.log("testing res.cookie", req.cookies["user_id"])

  userID = req.cookies["user_id"]
  if(!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }

	let shortURL = generateRandomString();
  
  urlDatabase[shortURL] =  {
    longURL: req.body.longURL,
    userID //bc key = value, shorthand works here
  },
	
  // urlDatabase[req.cookies['user_id'][shortURL]] = longURL;
  console.log("check if URL is in DATABSE", urlDatabase)
	res.redirect(`/urls/${shortURL}`);
});

// UPDATING URL handler
app.post('/urls/:id', (req, res) => {

  userID = req.cookies["user_id"]
  if(!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }

	const shortURL = req.params.id;
  console.log("URL DATABSE CHECK", urlDatabase)
  console.log("shortURL Check", shortURL)
	const newLongURL = req.body.longURL;
	
  urlDatabase[shortURL].longURL = newLongURL;
  console.log("URL DATABSE CHECK once updated", urlDatabase)
	// console.log(urlDatabase)
	res.redirect(`/urls/`);
});

//REGISTER PAGE
app.get('/register', (req, res) => {
	const templateVars = { user: users[req.cookies['user_id']] };
	res.render('register', templateVars);
});

//REGISTER use SUBMIT handler
app.post('/register', (req, res) => {
	let userRandomID = generateRandomString();

	if (req.body.username.trim() === '' || req.body.password.trim() === '') {
		return res.status(400).send('Error: no username/password inputed');
	}

	if (getUserByEmail(req.body.username)) {
		return res.status(400).send('Error: user already exists');
	}

	users[userRandomID] = {
		id: userRandomID,
		email: req.body.username,
		password: req.body.password
	};

	// console.log('user list', JSON.stringify(users));
	res.cookie('user_id', userRandomID);
	res.redirect('/urls');
});

//SHORT URL PAGE
app.get('/urls/:shortURL', (req, res) => {
  userID = req.cookies["user_id"]
  if(!userID) {
    return res.status(400).send('Error: User Not Logged In');
  }
  
  let shortURL = req.params.shortURL;
  // console.log("checking for SHORTURL", shortURL)
  const templateVars = {
		shortURL,
		longURL: urlDatabase[shortURL].longURL,
		user: users[req.cookies['user']]
	};
	//longURL is accessing the value of the key in URLDatabse object(url parameters is key)
	res.render('urls_show', templateVars);
});

//SHORT URL redirect to LONGURL (no login needed)
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[id].longURL;
  console.log("longURL is", longURL) 
	res.redirect(longURL);
});


// DELETING URLS
app.post('/urls/:shortURL/delete', (req, res) => {
	// console.log("good morning mr. west");

	const shortURL = req.params.shortURL;
	delete urlDatabase[req.cookies][shortURL];

	res.redirect(`/urls/`);
});

// LOGIN PAGE
app.get('/login', (req, res) => {
	const templateVars = { user: users[req.cookies['user_id']] };

	res.render('login', templateVars);
});

// LOGIN use SUBMIT handler
app.post('/login', (req, res) => {
  const userID = getUser(req.body.username)
  // console.log("GetUSER with req.body.username", userID)

  if (!userID){
    res.status(403).send("Error: Wrong Email")
    return 
  } if (users[userID].password !== req.body.password) {
    res.status(403).send("Error: Password")
    return
  }
  
  res.cookie('user_id', userID);
  res.redirect(`/urls/`);
});

// LOGOUT SUBMIT handler
app.post('/logout', (req, res) => {
	console.log("logout showing")
	
  res.clearCookie('user_id');

	res.redirect(`/urls/`);
});








app.get('/hello', (req, res) => {
	res.send('<html><body>Welcome <b>Player 1!</b></body></html>\n');
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
