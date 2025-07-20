const express = require('express');
const app = express();


// User Story: add registrations and login
app.get('/add-registrations-and-login', (req, res) => {
  res.send('Response for add-registrations-and-login');
});


module.exports = app;
