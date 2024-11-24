const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = {
  "testuser": { password: "password123" },
  "anotheruser": { password: "anotherpassword" }
};

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  return users.hasOwnProperty(username);

}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  return users[username] && users[username].password === password;

}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username exists and password is correct
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate a JWT token
  const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: 60*60 }); // Use a secret key for signing the JWT

  // Return the token to the user
  return res.status(200).json({
    message: "Login successful",
    token: token
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;  // الحصول على المراجعة من query parameter
  const token = req.headers['authorization']; // استخراج التوكن من الهيدر
  if (!token) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // التحقق من التوكن واستخراج اسم المستخدم
    const decoded = jwt.verify(token, 'your_secret_key');
    const username = decoded.username;

    // التحقق من وجود الكتاب
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // التحقق من وجود مراجعة من نفس المستخدم لهذا الكتاب
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      // إذا كانت المراجعة موجودة من نفس المستخدم، نقوم بتعديلها
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      // إذا لم تكن هناك مراجعة، نقوم بإضافتها
      books[isbn].reviews = books[isbn].reviews || {};
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review added successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error processing the request" });
  }
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Retrieve the username from the request header (via the JWT token)
  const username = req.user.username;

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book has any reviews
  if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }

  // Check if the review exists for this user
  if (!books[isbn].reviews[username]) {
    return res.status(403).json({ message: "You can only delete your own review" });
  }

  // Delete the review for the book
  delete books[isbn].reviews[username];

  // Return a success message
  return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
