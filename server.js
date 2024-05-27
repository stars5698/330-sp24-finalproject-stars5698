// Donna Quach, JavaScript 330B, Spring 2024
// server.js file for Final Project - Grocery List

const express = require("express");

const routes = require("./routes");

const server = express();
server.use(express.json());

server.use(routes);

module.exports = server;