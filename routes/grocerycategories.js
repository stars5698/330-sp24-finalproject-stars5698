// Donna Quach, JavaScript 330B, Spring 2024
// grocerycategories.js for Final Project - Grocery List

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
const categoryDAO = require('../daos/grocerycategory');

// Middleware 
// isAuthorized
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

// More Middleware 
// isAdmin 
// Checks if the user making the request is not an admin, then it should respond with a 403 Forbidden error.
const isAdmin = async (req, res, next) => {
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
                        // Check if user is an admin 
                        const userRoles = verifyToken.roles;
                        const checkAdminRole = userRoles.includes("admin");

                        if (!checkAdminRole) {
                            res.sendStatus(403);
                        }
                        else {
                            next();
                        }
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

// - Create: `POST /grocerycategories` - restricted to users with the "admin" role
router.post("/", isAuthorized, isAdmin, async (req, res, next) => {
    const category = req.body;

    if (!category || JSON.stringify(category) === '{}') {
        res.sendStatus(400);
    }
    else {
        try {
            const savedCategory = await categoryDAO.createCategory(req.body);
            res.json(savedCategory);
        }
        catch (e) {
            if (e instanceof categoryDAO.BadDataError) {
                res.status(400).send(e.message);
            }
            else {
                res.status(500).send(e.message);
            }
        }
    }
});

// - Update a grocery category: `PUT /grocerycategories/:id` - restricted to users with the "admin" role
router.put("/:id", isAuthorized, isAdmin, async (req, res, next) => {
    const categoryId = req.params.id;
    const category = req.body;
    if (!category || JSON.stringify(category) === '{}') {
        res.status(400);
    }
    else {
        try {
            const updateCategoryWorked = await categoryDAO.updateCategoryById(categoryId, category);
            res.sendStatus(updateCategoryWorked ? 200 : 400);
        }
        catch (e) {
            if (e instanceof categoryDAO.BadDataError) {
                res.status(400).send(e.message);
            }
            else {
                res.status(500).send(e.message);
            }
        }
    }
});

// - Get all categories: `GET /grocerycategories` - open to all users
router.get("/", isAuthorized, async (req, res, next) => {
    const getTheCategories = await categoryDAO.getAllCategories();
    res.json(getTheCategories);
});

// - Get a grocery category: `GET /grocerycategories/:id` - open to all users
router.get("/:id", isAuthorized, async (req, res, next) => {
    const getGroceryCategory = await categoryDAO.getByCategory(req.params.id);
    if (getGroceryCategory) {
        res.json(getGroceryCategory);
    }
    else {
        res.sendStatus(404);
    }
});

module.exports = router;