// Donna Quach, JavaScript 330B, Spring 2024
// user.js in daos for Final Project - Grocery List

const mongoose = require('mongoose');

const userModel = require('../models/user');

module.exports = {};

// Get a user record using their email 
// For POST /login route 
module.exports.getUser = (email) => {
    return userModel.findOne({ email: email }).lean();
}

// Update the user's password field 
// For PUT /password route 
module.exports.updateUserPassword = async (userId, password) => {
    if (userId) {
        const result = await userModel.updateOne({ email: userId }, { password: password });

        return result;
    }
    else {
        return false;
    }
}

// Store a user record 
// For POST /signup route 
module.exports.createUser = async (userObj) => {
    try {
        const createdUser = await userModel.create(userObj);
        return createdUser;
    }
    catch (e) {
        if (e.message.includes('Validation did not work')) {
            throw new BadDataError(e.message);
        }
        throw e;
    }
}

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;