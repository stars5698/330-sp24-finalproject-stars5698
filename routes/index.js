// Donna Quach, JavaScript 330B, Spring 2024
// index.js in routes folder for Final Project - Grocery List 

const { Router } = require("express");
const router = Router();

router.use("/auth", require('./auth'));
router.use("/grocerycategories", require('./grocerycategories'));
router.use("/groceryitems", require('./groceryitems'));
router.use("/grocerylists", require('./grocerylists'));

module.exports = router;