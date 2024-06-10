// Donna Quach, JavaScript 330B, Spring 2024
// groceryitems.js for Final Project - Grocery List

const { Router } = require("express");
const router = Router();

// Model
// Needed because hash needs to be stored here 
const theUserModel = require('../models/user');
const theItemModel = require('../models/groceryitem');

// Needed to hash raw passwords 
const bcrypt = require('bcrypt');

// Needed to work with JWTs
const jwt = require('jsonwebtoken');

// The secret for JWT
const secretJWT = 'tW8HC53SJQUgMshwhjrwi';

// Our relevant daos 
const userDAO = require('../daos/user');
const categoryDAO = require('../daos/grocerycategory');
const itemDAO = require('../daos/groceryitem');

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

// - Create: `POST /groceryitems` - restricted to users with the "admin" role
router.post("/", isAuthorized, isAdmin, async (req, res, next) => {
    const groceryItem = req.body;

    if (!groceryItem || JSON.stringify(groceryItem) === '{}') {
        res.sendStatus(400);
    }
    else {
        try {
            const savedGroceryItem = await itemDAO.createGroceryItem(req.body);
            res.json(savedGroceryItem);
        }
        catch (e) {
            if (e instanceof itemDAO.BadDataError) {
                res.status(400).send(e.message);
            }
            else {
                res.status(500).send(e.message);
            }
        }
    }
});

// - Update a grocery item: `PUT /groceryitems/:id` - restricted to users with the "admin" role
router.put("/:id", isAuthorized, isAdmin, async (req, res, next) => {
    const groceryitemId = req.params.id;
    const groceryitem = req.body;

    if (!groceryitem || JSON.stringify(groceryitem) === '{}') {
        res.status(400);
    }
    else {
        try {
            const updateGroceryItemWorked = await itemDAO.updateGroceryItemById(groceryitemId, groceryitem);
            res.json(updateGroceryItemWorked);
        }
        catch (e) {
            if (e instanceof itemDAO.BadDataError) {
                res.status(400).send(e.message);
            }
            else {
                res.status(500).send(e.message);
            }
        }
    }
});

// Search grocery items: ` GET /searchGroceryItems` - open to all users  
router.get("/searchGroceryItems", async (req, res, next) => {
    let search = req.query.search

    console.log(req.query.search);

    if (req.query != {}) {
        const matchingGroceryItems = await itemDAO.getAllGroceryItemsBySearch(search);
        res.json(matchingGroceryItems);
    }
    else {
        console.log('There is nothing');
    }
});

// - Get all items: `GET /groceryitems` - open to all users
router.get("/", isAuthorized, async (req, res, next) => {
    const getTheItems = await itemDAO.getAllItems();
    res.json(getTheItems);
});

// - Get a grocery item: `GET /groceryitems/:id` - open to all users
router.get("/:id", isAuthorized, async (req, res, next) => {
    const getGroceryItem = await itemDAO.getByGroceryItemId(req.params.id);
    if (getGroceryItem) {
        res.json(getGroceryItem);
    }
    else {
        res.sendStatus(404);
    }
});

// - Delete a grocery item: `DELETE /groceryitems/:id` - restricted to users with the "admin" role
router.delete("/:id", isAuthorized, isAdmin, async (req, res, next) => {
    const theGroceryItemId = req.params.id;

    try {
        const groceryItemDeleted = await itemDAO.deleteGroceryItem(theGroceryItemId);

        // If grocery item id (a grocery item) exists, then delete the grocery item using its grocery item id (_id)
        // If grocery item got deleted, then notify user. 
        if (groceryItemDeleted) {
            res.sendStatus(200);
        }
        else {
            res.sendStatus(404);
        }
    }
    catch (e) {
        next(e);
    }
});

module.exports = router;