// Donna Quach, JavaScript 330B, Spring 2024
// grocerylists.js for Final Project - Grocery List

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
const listDAO = require('../daos/grocerylist');

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

// - Create: `POST /grocerylists` - open to all users
// - Takes an array of grocery item \_id values. Grocery list should be created along with the `userId` of the user creating the grocery list.
router.post("/", isAuthorized, async (req, res, next) => {
    const groceryItemsToAddToList = req.body;
    const theUser = req.userId;

    try {
        const createTheGroceryList = await listDAO.createGroceryList(theUser, groceryItemsToAddToList);

        if (createTheGroceryList) {
            res.json(createTheGroceryList);
        }
        else {
            res.sendStatus(400);
        }
    }
    catch (e) {
        next(e);
    }
});

// - Update a grocery list: `PUT /grocerylists/:id` - open to all users 
router.put("/:id", isAuthorized, async (req, res, next) => {
    const groceryListId = req.params.id;
    const groceryList = req.body;
    if (!groceryList || JSON.stringify(groceryList) === '{}') {
        res.status(400);
    }
    else {
        try {
            const updateGroceryListWorked = await listDAO.updateGroceryListById(groceryListId, groceryList);
            res.sendStatus(updateGroceryListWorked ? 200 : 400);
        }
        catch (e) {
            if (e instanceof listDAO.BadDataError) {
                res.status(400).send(e.message);
            }
            else {
                res.status(500).send(e.message);
            }
        }
    }
});

// - Get all grocery lists: `GET /grocerylists` - return all the grocery lists made by the user making the request if not an admin user. If they are an admin user it should return all grocery lists in the DB.
router.get("/", isAuthorized, async (req, res, next) => {
    // Get the user
    // This will be used to determine what role(s) they have 
    const theUser = req.userId;

    const getTheGroceryLists = await listDAO.getAllGroceryLists(theUser);
    res.json(getTheGroceryLists);
});

// - Get an order: `GET /grocerylists/:id` - return a grocery list with the `groceryItems` array containing the full item objects rather than just their \_id. If the user is a normal user return a 404 if they did not make the grocery list. An admin user should be able to get any grocery list.
router.get("/:id", isAuthorized, async (req, res, next) => {
    // Get the user
    // This will be used to determine what role(s) they have 
    const theUser = req.userId;

    // Get the grocery list id
    const theGroceryListId = req.params.id;

    // Return the grocery list by id 
    const getTheGroceryList = await listDAO.getGroceryListById(theUser, theGroceryListId);

    if (!getTheGroceryList) {
        res.sendStatus(404);
    }
    else {
        res.json(getTheGroceryList);
    }
});

// - Delete a grocery list: `DELETE /grocerylists/:id` - open to all users 
router.delete("/:id", isAuthorized, async (req, res, next) => {
    const theGroceryListId = req.params.id;

    try {
        const groceryListDeleted = await listDAO.deleteGroceryList(theGroceryListId);

        // If grocery list id (a grocery list) exists, then delete the grocery list using its grocery list id (_id)
        // If grocery list got deleted, then notify user. 
        if (groceryListDeleted) {
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