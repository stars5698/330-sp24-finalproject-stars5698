// Donna Quach, JavaScript 330B, Spring 2024
// grocerycategory.js in daos for Final Project - Grocery Lidt

const mongoose = require('mongoose');

const categoryModel = require('../models/grocerycategory');

module.exports = {};

module.exports.getAllCategories = () => {
    return categoryModel.find().lean();
}

module.exports.getByCategory = (categoryId) => {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return null;
    }
    return categoryModel.findOne({ _id: categoryId }).lean();
}

module.exports.updateCategoryById = async (categoryId, newObj) => {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return false;
    }
    await categoryModel.updateOne({ _id: categoryId }, newObj);
    return true;
}

module.exports.createCategory = async (categoryData) => {
    try {
        const categoryCreated = await categoryModel.create(categoryData);
        return categoryCreated;
    }
    catch (e) {
        if (e.message.includes('validation failed')) {
            throw new BadDataError(e.message);
        }
        throw e;
    }
}

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;