const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Register the new user
  users[username] = { password };  // Storing password in plain text for simplicity (in real apps, hash the password)
  
  // Send a success message
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
// Using Async-Await with Axios to fetch books
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books');  // URL to fetch books
    const allBooks = response.data;
    return res.status(200).json(allBooks); // Send the books as a response
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);  // URL to fetch book details
    if (response.data) {
      return res.status(200).json(response.data); // Send book details if found
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});


// Get book details based on author
// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author.toLowerCase();  // Ensure case-insensitive matching
    const booksByAuthor = [];  // Initialize an array to store books that match the author

    // Use Axios to fetch all books from the external API
    const response = await axios.get('http://localhost:5000/books'); // URL to fetch all books

    // Iterate over the books object and check for matches
    for (let isbn in response.data) {
      if (response.data[isbn].author.toLowerCase() === author) {
        booksByAuthor.push(response.data[isbn]);  // If author matches, push the book to booksByAuthor
      }
    }

    // Check if any books were found for the author
    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor); // Send books by the author
    } else {
      return res.status(404).json({ message: "No books found by this author" }); // No books found
    }
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});


// Get all books based on title
// Get book details based on title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title.toLowerCase(); // Ensure case-insensitive matching
    const booksByTitle = [];  // Initialize an array to store books that match the title

    // Use Axios to fetch all books from the external API
    const response = await axios.get('http://localhost:5000/books'); // URL to fetch all books

    // Iterate over the books object and check for matches
    for (let isbn in response.data) {
      if (response.data[isbn].title.toLowerCase() === title) {
        booksByTitle.push(response.data[isbn]); // If title matches, push the book to booksByTitle
      }
    }

    // Check if any books were found for the title
    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle); // Send books with the matching title
    } else {
      return res.status(404).json({ message: "No books found with this title" }); // No books found
    }
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  try {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;

    // Check if the ISBN exists in the books object
    if (books[isbn]) {
      // If the book exists, check if it has reviews
      if (Object.keys(books[isbn].reviews).length > 0) {
        // If reviews exist, return the reviews for the book
        return res.status(200).json(books[isbn].reviews);
      } else {
        // If no reviews exist, return a message indicating no reviews
        return res.status(404).json({ message: "No reviews found for this book" });
      }
    } else {
      // If the ISBN does not exist, return an error message
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).json({ message: "Error fetching reviews for the book" });
  }
});

module.exports.general = public_users;
