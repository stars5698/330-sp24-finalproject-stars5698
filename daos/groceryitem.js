// Donna Quach, JavaScript 330B, Spring 2024
// groceryitem.js in daos for Final Project - Grocery List 

const mongoose = require('mongoose');

const itemModel = require('../models/groceryitem');

module.exports = {};

module.exports.getAllItems = () => {
    return itemModel.find().lean();
}

module.exports.getByGroceryItemId = (groceryItemId) => {
    if (!mongoose.Types.ObjectId.isValid(groceryItemId)) {
        return null;
    }
    return itemModel.findOne({ _id: groceryItemId }).lean();
}

module.exports.getAllGroceryItemsBySearch = (searchTerm) => {
    // Convert searchTerm to string and remove formatting to obtain just the value of the query object
    //const searchTermString = JSON.stringify(searchTerm);
    //const splitoncolonString = searchTermString.split(":");
    //const getQueryValueString = splitoncolonString[1];

    // Source: https://stackoverflow.com/questions/8307039/javascript-remove-braces
    //const queryValueNoCurlyBraces = getQueryValueString.replace(/[{}]/g, "");

    // Note: split(), map(), and join() are needed to wrap each word from search with double quotes
    // Need to append code for that to search term to return books based on MULTIPLE search words
    // Without the appended code, the text query will only work for searches using a single word
    // Source: https://stackoverflow.com/questions/16902674/mongodb-text-search-and-multiple-search-words

    return itemModel.find(
        { $text: { $search: searchTerm } },
        { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
}

module.exports.updateGroceryItemById = async (theGroceryItemId, newObj) => {
    if (!mongoose.Types.ObjectId.isValid(theGroceryItemId)) {
        return false;
    }
    await itemModel.updateOne({ _id: theGroceryItemId }, newObj);
    return true;
}

module.exports.createGroceryItem = async (groceryItemData) => {
    try {
        const groceryItemCreated = await itemModel.create(groceryItemData);
        return groceryItemCreated;
    }
    catch (e) {
        if (e.message.includes('validation failed')) {
            throw new BadDataError(e.message);
        }
        throw e;
    }
}

module.exports.deleteGroceryItem = async (theGroceryItemId) => {
    try {
        const groceryItemToDelete = await itemModel.findOneAndDelete({ _id: theGroceryItemId }).lean();

        if (!groceryItemToDelete) {
            return null;
        }
        return { notification: 'Was able to delete:', groceryItemToDelete };
    }
    catch (e) {
        console.error(e);
    }
}

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;