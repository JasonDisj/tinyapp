const express = require("express");
const app = express();
const morgan = require("morgan");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const PORT = 8080;

const { generateRandomString, urlsForUser, getUserByEmail } = require('./helpers');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const userDatabase = { // userdatabase example
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(morgan("dev"));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['123', '456']
}));

// Home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const cookie = req.cookies["user_id"];
  const userURLs = urlsForUser(cookie, urlDatabase);
  const templateVars = { urls: userURLs, userData: userDatabase[req.cookies["user_id"]] };
  console.log(userURLs);

  if (!cookie) {
    return res.status(400).send('You need to login to see your URLs!');
  }
  res.render("urls_index", templateVars);
});

// POST urls
app.post("/urls", (req, res) => {
  if (!userDatabase[req.cookies["user_id"]]){
    res.send("<h1>Only Registered Users Can Shorten URLs</h1>");
  }
  let randomUrl = generateRandomString();
  // console.log(req.body.longURL); ===> body: { longURL: 'www.nba.com' }
  urlDatabase[randomUrl] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}; // "form" data comes from req.body
  res.redirect(`/urls/${randomUrl}`); // <=== redirect to ro /urls/:id
});

// Create new URL
app.get("/urls/new", (req, res) => {
  if (!userDatabase[req.cookies["user_id"]]){
    res.redirect("/login");
    return;
  }
  const templateVars = { userData: userDatabase[req.cookies["user_id"]]};
  // console.log("req.cookies", req.cookies);
  res.render("urls_new", templateVars);
});

// Head to /urls/randomSixDigits page
app.get("/urls/:id", (req, res) => { // :id like a container to have shortUrls
  // console.log(req.params.id);
  const shortUrl = req.params.id
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl].longURL, userData: userDatabase[req.cookies["user_id"]]};
  if (!req.cookies["user_id"]) {
    res.status(403).send(`<h1><b>403: You're trying to access a shortened URL that does not exist!</b></h1>`);
  }
  if ((urlDatabase[req.params.id].userID !== req.cookies["user_id"])) {
    return res.status(403).send('<h1><b>403: Sorry! You do not own the URL!</b></h1>');
  }
  res.render("urls_show", templateVars);
});

// Registration page (GET)
app.get("/register", (req, res) => {
  if (userDatabase[req.cookies["user_id"]]){
    // const templateVars = { userData: userDatabase[req.cookies["user_id"]]};
    res.redirect("/urls");
  }
  const templateVars = { userData: userDatabase[req.cookies["user_id"]]};
  res.render("urls_register", templateVars);
});

// Registration page (POST)
app.post("/register", (req, res) => {
  console.log(userDatabase);
  if (req.body.email === "" || req.body.password === "") {
    res.status(404).send("Can not put in empty email or password!");
  }
  if (getUserByEmail(req.body.email, userDatabase)) {
    res.status(404).send("This email has been registered!");
  }
    const randomUsername = generateRandomString();
    const password = req.body.password;
    const hashpassword = bcrypt.hashSync(password, 10);
    userDatabase[randomUsername] = {id: randomUsername, email: req.body.email, password: hashpassword};
    // res.cookie("user_id", randomUsername);
    req.session.user_id = randomUsername;
    res.redirect("/urls");
  });

// Delete button
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  // console.log("delete route id", id);
  delete urlDatabase[id].longURL;
  res.redirect("/urls");
});

// Edit button
app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id
  res.redirect(`/urls/${id}`);
});

// Login page
app.get("/login", (req, res) => {
  if (userDatabase[req.cookies["user_id"]]){
    // const templateVars = { userData: userDatabase[req.cookies["user_id"]]};
    res.redirect("/urls");
  }
  const templateVars = { userData: userDatabase[req.cookies["user_id"]]};
  res.render("urls_login", templateVars);
});

// Login button (set up cookie)
app.post("/login", (req, res) => {
  // console.log('req.body', req.body); // { email: 'y@ymail.com', password: 'cc' }
  
  const existingUser = getUserByEmail(req.body.email, userDatabase) // function return userDatabase[id]
  console.log(existingUser);
  if (!existingUser) {
    res.status(403).send("Your email can not be found!");
    return;
  }
  if (bcrypt.compareSync(req.body.password, existingUser.password)) {
    // res.cookie("user_id", existingUser.id);
    req.session.user_id = existingUser.id;
    res.redirect("/urls");
    } else {
      res.status(403).send("The password is not correct!");
    }
});

// Logout status
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // logout to clear cookie
  res.redirect("/urls");
});

// Submit button
app.post("/urls/:id/", (req, res) => {
  const id = req.params.id
  const longUrl = req.body.longUrl
  urlDatabase[id].longURL = longUrl;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  console.log("id", req.params.id);
  const longURL = urlDatabase[req.params.id].longURL;
  if (urlDatabase[req.params.id].longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL does not exist"); // edge cases
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("*", (req, res) => {
  res.status(404).send("This is not the page you are looking for");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
