Tiny-url app created by Kehan Fu

**Necessary dependencies**

"bcryptjs" version 2.4.3,
"body-parser" version 1.19.0,
"cookie-session" version 1.4.0,
"ejs" version 3.1.6,
"express" version 4.17.1,
"method-override" version 3.0.0

Download via npm install command. Upon download compleetion, use command node in express_server(express_server.js) for more details. 

**Basic Functionality + Final Product:**
!["Screenshot of URLs page"](https://github.com/KehanYe/tinyapp/blob/master/docs/urls-page-singleURL.png)
!["Screenshot of URLs page with several URLs"](https://github.com/KehanYe/tinyapp/blob/master/docs/urls-page-severlURL.png)
!["Screenshot of Register page"](https://github.com/KehanYe/tinyapp/blob/master/docs/register-page.png)
!["Screenshot of URLs update page"](https://github.com/KehanYe/tinyapp/blob/master/docs/edit-URL.png)
!["Screenshot of create new URLs page"](https://github.com/KehanYe/tinyapp/blob/master/docs/create-newURL.png)

**HEADER**

1. if a user is logged in, the header shows:
  * the user's email
  * a logout button which makes a POST request to /logout

2. if a user is not logged in, the header shows:
  * a link to the login page (/login)
  * a link to the registration page (/register)

**GET /**

1. if user is logged in:
  * (Minor) redirect to /urls

2. if user is not logged in:
  * (Minor) redirect to /login

**GET /urls**

1. if user is logged in:
  * returns HTML with site header (see Display Requirements) a list/table of URLs the user has created each list item containing: 
  * a short URL the short URL's  matching long URL an edit button which makes a GET request to /urls/:id a delete button which makes a POST request to /urls/:id/delete 

2. if user is not logged in:
  * returns HTML with a relevant error message

**GET /urls/new**

1. if user is logged in:
  * returns HTML with site header (see Display Requirements) a form which contains: a text input field for the original (long) URL a submit button which makes a POST request to /urls

2. if user is not logged in:
  * redirects to the /login page

**GET /urls/:id**

1. if user is logged in and owns the URL for the given ID:
  * returns HTML with the site header (see Display Requirements) the short URL (for given ID) a form which contains: the corresponding long URL an update button which makes a POST request to /urls/:id

2. if a URL for the given ID does not exist:
  * (Minor) returns HTML with a relevant error message

3. if user is not logged in:
  * returns HTML with a relevant error message

4. if user is logged it but does not own the URL with the given ID:
  * returns HTML with a relevant error message

**GET /u/:id**

1. if URL for the given ID exists:
  * redirects to the corresponding long URL

2. if URL for the given ID does not exist:
  (Minor) returns HTML with a relevant error message

**POST /urls**

1. if user is logged in:
  * generates a short URL, saves it, and associates it with the user redirects to /urls/:id, where :id matches the ID of the newly saved URL

2. if user is not logged in:
  * (Minor) returns HTML with a relevant error message

**POST /urls/:id**

1. if user is logged in and owns the URL for the given ID:
  * updates the URL redirects to /urls

2. if user is logged in but does not own the URL for the given ID:
  (* Minor) returns HTML with a relevant error message

**POST /urls/:id/delete**

1. if user is logged in and owns the URL for the given ID:
  * deletes the URL redirects to /urls

2. if user is not logged in:
  * (Minor) returns HTML with a relevant error message

3. if user is logged in but does not own the URL for the given ID:
  * (Minor) returns HTML with a relevant error message

**GET /login**

1. if user is logged in:
  * (Minor) redirects to /urls

2. if user is not logged in:
  * returns HTML with: a form which contains input fields for email and password submit button that makes a POST request to /login

**GET /registe**

1. if user is logged in:
  * (Minor) redirects to /urls

2. if user is not logged in:
  returns HTML with: a form which contains input fields for email and password a register button that makes a POST request to /register

**POST /login**

1. if email and password params match an existing user:
  * sets a cookie redirects to /urls

2. if email and password params don't match an existing user:
  * returns HTML with a relevant error message

**POST /register**

1. if email or password are empty:
  * returns HTML with a relevant error message

2. if email already exists:
  * returns HTML with a relevant error message:

3. if registeration is approved:
  * creates a new user encrypts the new user's password with bcrypt and sets a cookie redirects to /urls

**POST /logout**

1. deletes cookie redirects to /urls
