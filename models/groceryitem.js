// Donna Quach, JavaScript 330B, Spring 2024
// groceryitem.js file for Final Project - Grocery List 

const mongoose = require("mongoose");

const GroceryCategory = require('./grocerycategory');

const itemSchema = new mongoose.Schema({
    itemName: { type: String, unique: true, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: GroceryCategory, required: true, index: true },
    itemPrice: { type: Number, required: true }
});

module.exports = mongoose.model("items", itemSchema);