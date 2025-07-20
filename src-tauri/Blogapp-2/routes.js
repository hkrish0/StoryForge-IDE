const express = require('express');
const app = express();


// User Story: add registration and login
app.get('/add-registration-and-login', (req, res) => {
  res.send('Response for add-registration-and-login');
});


module.exports = app;
