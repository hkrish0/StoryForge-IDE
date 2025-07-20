const express = require('express');
const app = express();


// User Story: User registration and login
app.get('/user-registration-and-login', (req, res) => {
  res.send('Response for user-registration-and-login');
});


// User Story: Create/edit/delete blog posts
app.get('/create/edit/delete-blog-posts', (req, res) => {
  res.send('Response for create/edit/delete-blog-posts');
});


module.exports = app;
