// Donna Quach, JavaScript 330B, Spring 2024
// grocerylist.js for Final Project - Grocery List 

const mongoose = require("mongoose");

const User = require('./user');
const GroceryItem = require('./groceryitem');

const groceryListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    groceryItems: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: GroceryItem }],
        required: true
    }
});

module.exports = mongoose.model("lists", groceryListSchema); 