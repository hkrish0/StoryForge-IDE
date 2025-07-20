const express = require('express');
const app = express();


// User Story: add registration androgen
app.get('/add-registration-androgen', (req, res) => {
  res.send('Response for add-registration-androgen');
});


module.exports = app;
