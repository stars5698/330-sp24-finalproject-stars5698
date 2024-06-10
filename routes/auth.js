// Donna Quach, JavaScript 330B, Spring 2024
// auth.js for Final Project - Grocery List

const { Router } = require("express");
const router = Router();

// Model
// Needed because hash needs to be stored here 
const theUserModel = require('../models/user');

// Needed to hash raw passwords 
const bcrypt = require('bcrypt');

// Needed to work with JWTs
const jwt = require('jsonwebtoken');

// The secret for JWT
const secretJWT = 'tW8HC53SJQUgMshwhjrwi';

// Our relevant daos 
const userDAO = require('../daos/user');

// Middleware 
// For Auth: PUT /password
const isAuthorized = async (req, res, next) => {
    // Get bearer token from authorization header
    const bearerToken = req.headers.authorization;

    // Check if token exists in authorization header
    if (bearerToken === undefined || bearerToken === '') {
        res.sendStatus(401);
    }
    else {
        // Remove Bearer from bearer token to get just token text 
        let tokenText;
        if (bearerToken.startsWith('Bearer ')) {
            // Source: https://stackoverflow.com/questions/50284841/how-to-extract-token-string-from-bearer-token
            tokenText = bearerToken.substring(7, bearerToken.length);

            // Check if token string follows the proper format 
            // Source of regex pattern: https://www.regextester.com/105777
            const regexPattern = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

            const isTokenFormatValid = regexPattern.test(tokenText);

            // Reject bad token if it does not follow format 
            if (!isTokenFormatValid) {
                res.sendStatus(401);
            }
            else {
                try {
                    // Verify incoming token
                    let verifyToken = jwt.verify(tokenText, secretJWT);

                    if (verifyToken) {
                        // If token is verified, associate user with that token
                        req.userId = verifyToken.email;
                        // Make req.token = the token string that was from the Bearer token 
                        req.token = tokenText;

                        next();
                    }
                    else {
                        res.sendStatus(401);
                    }
                }
                catch (e) {
                    console.error(e);
                    throw e;
                }
            }
        }
    }
}

// Signup a user 
router.post("/signup", async (req, res, next) => {
    const theUserEmail = req.body.email;

    // Raw password (before hash)
    const userPassword = req.body.password;

    // Check if password was provided with email 
    if (userPassword === undefined || userPassword === '') {
        res.sendStatus(400);
    }
    else {
        try {
            // Check if repeat signup (i.e. if user email already exists)
            // Otherwise create user and send status 200 
            let findUserEmail = await userDAO.getUser(theUserEmail);
            if (findUserEmail) {
                res.sendStatus(409);
            }
            else {
                // Hash the raw password using 10 salt rounds 
                const hashToStore = await bcrypt.hash(userPassword, 10);

                try {
                    // Set up user info then create user based on email, hash, and role(s)
                    // Every user created will have at a minimum a role of "user"
                    // Line below was to prevent Object Parameter Error 
                    // Source: https://stackoverflow.com/questions/56520377/saving-data-into-mongodb-returns-an-objectparametererror
                    const newUser = new theUserModel({ email: theUserEmail, password: hashToStore, roles: ["user"] });

                    const savedUser = await userDAO.createUser(newUser);
                    res.json(savedUser);
                }
                catch (e) {
                    if (e instanceof userDAO.BadDataError) {
                        console.log(e.message);
                    }
                }
            }
        }
        catch (e) {
            if (e instanceof userDAO.BadDataError) {
                console.log(e.message);
            }
        }
    }
});

// Find user based on email 
// References getUser(email) dao  
router.post("/login", async (req, res, next) => {
    // Get password provided by user 
    const incomingPassword = req.body.password;

    // Get user using email
    const incomingUser = req.body.email;

    // Check if password was provided at all prior to log in 
    if (incomingPassword === undefined || incomingPassword === '') {
        res.sendStatus(400);
    }
    else {
        try {
            // Try to find the user 
            const findUser = await userDAO.getUser(incomingUser);

            // If user is found, then compare passwords
            if (findUser) {

                // Get stored password (hash) for user
                const storedPassword = findUser.password;

                // Get email for user 
                const userEmail = findUser.email;

                // Get the _id for the incoming user 
                const theUserId = findUser._id;

                // Get the role(s) for the incoming user
                const userRoles = findUser.roles;

                try {
                    // Compare stored password with incoming password
                    const passwordMatch = await bcrypt.compare(incomingPassword, storedPassword);

                    // If stored password and incoming password match, generate JWT and return to user
                    // However, do not store password hash within JWT
                    if (!passwordMatch) {
                        res.sendStatus(401);
                    }
                    else {
                        // Store user email, _id, and roles as token data 
                        const jwtData = { email: userEmail, _id: theUserId, roles: userRoles };

                        // Encode the user email, _id, and roles inside the token using the secret 
                        let theToken = jwt.sign(jwtData, secretJWT);

                        res.json({ token: theToken });
                        res.sendStatus(200);
                    }
                }
                catch (e) {
                    if (e instanceof userDAO.BadDataError) {
                        console.log(e.message);
                    }
                }
            }
            else {
                res.sendStatus(401);
            }
        }
        catch (e) {
            if (e instanceof userDAO.BadDataError) {
                console.log(e.message);
            }
        }
    }
});

// // Change password for user 
// References updateUserPassword(userId, password) dao 
router.put("/password", isAuthorized, async (req, res, next) => {
    // Get proposed password
    const incomingPassword = req.body.password;

    // Get user's userid
    const incomingUserId = req.userId;

    // If user is logged in then update password
    // Check if new password user enters is valid to update password 
    if (incomingPassword === undefined || incomingPassword === '') {
        res.sendStatus(400);
        console.log('Invalid password!');
    }
    else {
        try {
            // Hash user's proposed password
            const proposedPasswordHash = await bcrypt.hash(incomingPassword, 10);

            // Update user's password if they're logged in 
            const updatePassword = await userDAO.updateUserPassword(incomingUserId, proposedPasswordHash);

            res.json(updatePassword);
        }
        catch (e) {
            next(e);
        }
    }
});

module.exports = router;