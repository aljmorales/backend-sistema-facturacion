const db = require("../../DB/postgres");
const ctrl = require("./controlador");

module.exports= ctrl(db);