const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const ExpressError = require('../expressError');
const router = new express.Router();

/** POST /login - login: {username, password} => {token} */
router.post('/login', async function(req, res, next) {
  try {
    const { username, password } = req.body;
    const isAuthenticated = await User.authenticate(username, password);
    if (isAuthenticated) {
      const token = jwt.sign({ username }, SECRET_KEY);
      await User.updateLoginTimestamp(username);
      return res.json({ token });
    } else {
      throw new ExpressError('Invalid username/password', 400);
    }
  } catch (err) {
    return next(err);
  }
});

/** GET /login - render login page */
router.get('/login', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../public/html/login.html'));
  });

/** POST /register - register user: registers, logs in, and returns token. */
router.post('/register', async function(req, res, next) {
  try {
    const newUser = await User.register(req.body);
    const token = jwt.sign({ username: newUser.username }, SECRET_KEY);
    await User.updateLoginTimestamp(newUser.username);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** GET /register - render registration page */
router.get('/register', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/html/register.html'));
});

module.exports = router;
