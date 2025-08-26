const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username & password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    // If new, push user into array
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// TASK 10: Using Promise callback 
public_users.get('/books-promise', (req, res) => {
    new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("No books found");
        }
    })
    .then(data => res.status(200).json({
        message: "Books retrieved successfully using Promise)",
        books: data
    }))
    .catch(err => res.status(500).json({ message: "Error fetching books", error: err }));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.status(200).json(books[isbn]);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let result = [];
  
    Object.keys(books).forEach(key => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        result.push(books[key]);
      }
    });
  
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({message: "No books found for this author"});
    }
});
// TASK 11: Get book by ISBN using async/await
public_users.get('/isbn-async/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await new Promise((resolve, reject) => {
            const result = books[isbn];
            if (result) resolve(result);
            else reject(`Book with ISBN ${isbn} not found`);
        });
        res.status(200).json({ message: `Book with ISBN ${isbn} retrieved successfully (Async/Await)`, book });
    } catch (err) {
        res.status(404).json({ message: err });
    }
});

// TASK 12: Get books by author using async/await
public_users.get('/author-async/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const filteredBooks = await new Promise((resolve, reject) => {
            const result = Object.values(books).filter(book => book.author === author);
            if (result.length > 0) resolve(result);
            else reject(`No books found for author: ${author}`);
        });

        res.status(200).json({
            message: `Books by author ${author} retrieved successfully (Async/Await)`,
            books: filteredBooks
        });
    } catch (err) {
        res.status(404).json({ message: err });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let result = [];

    Object.keys(books).forEach(key=> {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
            result.push(books[key]);
        }
    });

    if (result.length > 0) {
        res.status(200).json(result);
    } else {
        res.status(404).json({message: "No books found with this title"});
    }
});

// TASK 13: Get book by title using async/await
public_users.get('/title-async/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const filteredBooks = await new Promise((resolve, reject) => {
            const result = Object.values(books).filter(book => book.title === title);
            if (result.length > 0) resolve(result);
            else reject(`No books found for title: ${title}`);
        });

        res.status(200).json({
            message: `Books by title ${title} retrieved successfully (Async/Await)`,
            books: filteredBooks
        });
    } catch (err) {
        res.status(404).json({ message: err });
    }
});
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.status(200).json(books[isbn].reviews);
      } else {
        res.status(404).json({message: "Book not found"});
      }
});

module.exports.general = public_users;
