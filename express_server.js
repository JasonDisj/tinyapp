const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const PORT = 8080;
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
app.use(cookieParser());

// Home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, userData: userDatabase[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
  console.log("userData:", userDatabase);
});

// POST urls
app.post("/urls", (req, res) => {
  let randomUrl = generateRandomString();
  // console.log(req.body.longURL); ===> body: { longURL: 'www.nba.com' }
  urlDatabase[randomUrl] = req.body.longURL; // "form" data comes from req.body
  res.redirect(`/urls/${randomUrl}`); // <=== redirect to ro /urls/:id
});

// Create new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { userData: userDatabase[req.cookies["user_id"]]};
  // console.log("req.cookies", req.cookies);
  res.render("urls_new", templateVars);
});

// Head to /urls/randomSixDigits page
app.get("/urls/:id", (req, res) => { // :id like a container to have shortUrls
  // console.log(req.params.id);
  const shortUrl = req.params.id
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl], userData: userDatabase[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

// Registration page (GET)
app.get("/register", (req, res) => {
  const templateVars = { userData: userDatabase[req.cookies["user_id"]]};
  res.render("urls_register", templateVars);
  res.redirect("/urls");
});

// Registration page (POST)
const findUserByEmail = (email, users) => { // function to loop through userdatabase
  for (let id in users) {
    if (users[id]["email"] === email) {
      return users[id];
    }
  }
  return null;
}
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(404).send("Can not put in empty email or password!");
  }
  if (findUserByEmail(req.body.email, userDatabase)) {
    res.status(404).send("This email has been registered!");
  }
    let randomUsername = generateRandomString();
    userDatabase[randomUsername] = {id: randomUsername, email: req.body.email, password: req.body.password};
  // console.log(req.cookies); ===> req.cookie checking cookie value
  res.cookie("user_id", randomUsername)
  res.redirect("/urls");
  });

// Delete button
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  // console.log("delete route id", id);
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Edit button
app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id
  res.redirect(`/urls/${id}`);
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = { userData: userDatabase[req.cookies["user_id"]]};
  res.render("urls_login", templateVars);
  res.redirect("/urls");
});

// Login button (set up cookie)
app.post("/login", (req, res) => {
  const existingUser = findUserByEmail(req.body.email, userDatabase)
  if (!existingUser) {
    res.status(403).send("Your email can not be found!");
  }
  if (existingUser.password !== req.body.password) {
    res.status(403).send("Your password is wrong!");
  }
  
  res.cookie("user_id", existingUser.id);
  res.redirect("/urls");
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
  urlDatabase[id] = longUrl;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  console.log("id", req.params.id);
  const longURL = urlDatabase[req.params.id];
  if (urlDatabase[req.params.id]) {
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
