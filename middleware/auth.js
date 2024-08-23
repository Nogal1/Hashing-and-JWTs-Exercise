/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  // Skip authentication for specific routes
  const pathsToSkip = ['/auth/login', '/auth/register'];
  if (pathsToSkip.includes(req.path)) {
    return next();
  }

  try {
    // Attempt to get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'

    // If the token is not in the header, get it from the body
    const token = tokenFromHeader || req.body._token;

    // If no token is found, return a 401 Unauthorized status
    if (!token) {
      return res.sendStatus(401); // No token, unauthorized
    }

    // Verify the token
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload; // Attach payload to req.user
    return next();
  } catch (err) {
    return next(new ExpressError("Unauthorized", 401));
  }
}



/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}
// end

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser
};
