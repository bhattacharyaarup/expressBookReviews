const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios").default;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  let uname = req.body.username;
  let password = req.body.password;

  if (uname && password) {
    //check for existing username
    let exists = users.filter((user) => {
      return user.username === uname;
    });
    if (exists.length === 0) {
      users.push({ username: uname, password: password });
      return res.status(200).json({ message: "User created" });
    } else {
      res.status(404).json({ message: "User already exists" });
    }
  } else {
    res.send("Username or password not provided");
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return new Promise((resolve, reject) => {
    let mybook = books;
    if (mybook) {
      resolve(res.send(JSON.stringify(mybook, null, 3)));
    } else {
      reject("Book not found");
    }
  });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    let mybooks = response.data;

    let isbn = req.params.isbn;
    if (isbn) {
      let book = mybooks[isbn];
      if (book) {
        res.send(JSON.stringify(book, null, 1));
      } else {
        res.send("ISBN not found");
      }
    } else {
      res.send("Invalid ISBN...");
    }
  } catch (error) {
    return res.status(500).send("Error retrieving books");
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  return new Promise((resolve, reject) => {
    let temp_book = [];
    let flag = false;
    for (const key in books) {
      if (books[key].author === req.params.author) {
        temp_book.push(books[key]);
        flag = true;
      }
    }
    if (flag === true) {
      resolve(res.send(JSON.stringify(temp_book, null, 3)));
    } else {
      reject(res.send("Author not found"));
    }
  });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  return new Promise((resolve, reject) => {
    let flag = false;
    let key = 0
    for (key in books) {
      if (books[key].title === req.params.title) {
        flag = true;
      }
    }
    if (flag) resolve(res.send(JSON.stringify(books[key], null, 3)));
    else reject(res.send("Book title not found"));
  });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  if (isbn.length > 0) {
    let book = books[isbn];
    if (book) {
      res.send(book.reviews);
    }
  } else {
    res.send("Invalid ISBN");
  }
});

module.exports.general = public_users;
