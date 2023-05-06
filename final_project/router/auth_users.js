const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let data = users.filter((user) => {
    return user.username === username;
  });
  if (data.length > 0) return true;
  else return false;
};

const authenticatedUser = (username, password) => {
  let data = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (data.length > 0) return true;
  else return false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (isValid(username)) {
    if (authenticatedUser(username, password)) {
      let token = jwt.sign({ data: password }, "access", {
        expiresIn: 60 * 60,
      });
      req.session.authorization = { token, username };
      return res.status(200).json({ message: "User logged in..." });
    } else {
      return res.status(404).json({ message: "Username authentication fail." });
    }
  } else {
    res.status(404).json({ message: "Username not found" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const user = req.session.authorization["username"];

  let book = books[isbn];

  if (book) {
    books[isbn]["reviews"][user]=review
    res.status(200).json({"message":"review posted"});
    
  } else {
    res.status(404).json({ message: "ISBN not found" });
  }
});

regd_users.delete("/auth/review/:isbn",(req,res)=>{
  const isbn = req.params.isbn;
  const username = req.session.authorization["username"];
  if(books[isbn]){
    delete books[isbn]["reviews"][username];
    res.status(200).json({"message":"reviews deleted"});
  }
  else{
    res.status(404).json({"message":"ISBN Not found"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
