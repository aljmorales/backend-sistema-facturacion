require('dotenv').config();
const config = require('./config');
const app = require("./app");

app.listen(app.get("port"), ()=>{
    console.log("Escuchando en el puerto ", app.get("port"));
})