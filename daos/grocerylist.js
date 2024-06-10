// Donna Quach, JavaScript 330B, Spring 2024
// grocerylist.js in daos for Final Project - Grocery List 

const mongoose = require('mongoose');

const userModel = require('../models/user');

const categoryModel = require('../models/grocerycategory');

const itemModel = require('../models/groceryitem');

const listModel = require('../models/grocerylist');

module.exports = {};

// Get all grocery lists
module.exports.getAllGroceryLists = async (theUserEmail) => {
    // Find the user
    const getUser = await userModel.findOne({ email: theUserEmail });
    // Determine if the user is an admin or not 
    if (getUser) {
        const getUserRoles = getUser.roles;
        const checkAdminRole = getUserRoles.includes("admin");

        // If admin, return ALL existing grocery lists 
        // Otherwise, return grocery lists for a specific user 
        if (checkAdminRole) {
            return await listModel.find().lean();
        }
        else {
            // Get _id for user using their email and get all grocery lists for that user 
            const theUserId = getUser._id;
            return await listModel.find({ userId: theUserId }).lean();
        }
    }
    else {
        return false;
    }
}

// Get grocery list by id
module.exports.getGroceryListById = async (theUserEmail, someGroceryListId) => {
    // Find the user
    const getUser = await userModel.findOne({ email: theUserEmail });
    // Determine if the user is an admin or not 
    if (getUser) {
        const getUserRoles = getUser.roles;
        const checkAdminRole = getUserRoles.includes("admin");

        // If admin, return someone else's grocery list 
        // Otherwise, return a grocery list for a specific user 
        if (checkAdminRole) {
            const theGroceryList = await listModel.find({ _id: someGroceryListId }).lean();
            const theGroceryListNoArray = theGroceryList[0];

            // Get item name, grocery category, and price for each item
            const theItemsFromGroceryList = theGroceryListNoArray.groceryItems;

            // Set up array to store items (item name, grocery category, and price)
            let items = [];

            // Break up item list into individual items
            for (let i = 0; i < theItemsFromGroceryList.length; i++) {
                // Get the item name, grocery category, and price for each item
                const doesItemExist = await itemModel.findOne({ _id: theItemsFromGroceryList[i] });
                items[i] = doesItemExist;
            }

            // Return grocery list including item name, grocery title, and price for a user 
            let theGroceryListSummaryAdmin = {};
            theGroceryListSummaryAdmin = { "groceryItems": items, "userId": theGroceryListNoArray.userId };
            return theGroceryListSummaryAdmin;
        }
        else {
            const theGroceryList = await listModel.find({ _id: someGroceryListId, userId: getUser._id }).lean();
            const theGroceryListNoArray = theGroceryList[0];

            if (theGroceryListNoArray === undefined) {
                return false;
            }
            else {
                // Get item name, grocery category, and price for each item
                const theItemsFromGroceryList = theGroceryListNoArray.groceryItems;

                // Set up array to store items (item name, grocery category, and price)
                let items = [];

                // Break up item list into individual items
                for (let i = 0; i < theItemsFromGroceryList.length; i++) {
                    // Get the item name, grocery category, and price for each item
                    const doesItemExist = await itemModel.findOne({ _id: theItemsFromGroceryList[i] });
                    items[i] = doesItemExist;
                }

                // Return grocery list including item name, grocery category, and price for a user  
                let theGroceryListSummaryUser = {};
                theGroceryListSummaryUser = { "groceryItems": items, "userId": theGroceryListNoArray.userId };
                return theGroceryListSummaryUser;
            }
        }
    }
    else {
        return false;
    }
}

// Update grocery list by id 
module.exports.updateGroceryListById = async (theGroceryListId, newObj) => {
    if (!mongoose.Types.ObjectId.isValid(theGroceryListId)) {
        return false;
    }
    await listModel.updateOne({ _id: theGroceryListId }, newObj);
    return true;
}

// Create a grocery list 
module.exports.createGroceryList = async (theUserEmail, itemArray) => {
    // Receive list of grocery items user needs 
    const groceryList = itemArray;

    // Get _id for the user (using their email)
    const getUser = await userModel.findOne({ email: theUserEmail });

    // If user is found
    if (getUser) {
        // Break up item list into individual items 
        for (let someItemId of groceryList) {
            // Check if that item exists 
            const doesItemExist = await itemModel.findOne({ _id: someItemId });

            if (doesItemExist === null) {
                return false;
            }
        }

        // If item exists, create the grocery shopping list 
        const groceryListReturned = await listModel.create({ userId: getUser._id, groceryItems: groceryList });

        return groceryListReturned;
    }
}

// Delete grocery list by id 
module.exports.deleteGroceryList = async (theGroceryListId) => {
    try {
        const groceryListToDelete = await listModel.findOneAndDelete({ _id: theGroceryListId }).lean();

        // Check if grocery item got deleted
        if (!groceryListToDelete) {
            return null;
        }
        return { notification: 'Was able to delete:', groceryListToDelete };
    }
    catch (e) {
        console.error(e);
    }
}