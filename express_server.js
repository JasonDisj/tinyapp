const express = require("express");
const app = express();
const PORT = 8080;
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// POST urls
app.post("/urls", (req, res) => {
  let randomUrl = generateRandomString();
  console.log(req.body.longURL); // body: { longURL: 'www.nba.com' }
  urlDatabase[randomUrl] = req.body.longURL;
  // res.send("Ok");
  
  res.redirect(`/urls/${randomUrl}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => { // :id like a container to have shortUrls
  console.log(req.params.id);
  const shortUrl = req.params.id
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl]};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  console.log("id", req.params.id);
  const longURL = urlDatabase[req.params.id];
  if (urlDatabase[req.params.id]) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL does not exist"); //edge cases
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