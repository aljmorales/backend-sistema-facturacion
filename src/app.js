const express = require("express");
const config = require("./config");
const cors = require("cors");
const morgan = require("morgan");

const productores = require("./modulos/productores/rutas.js");
const ctn = require("./modulos/ctn/rutas.js");
const ingresos = require("./modulos/ingresos/rutas.js");
const facturas = require("./modulos/facturas/rutas.js");
const detalle = require("./modulos/detalle_factura/rutas.js");

require('dotenv').config();


const app = express();

var corsOptions={
    origin: "*",
    optionSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

//CONFIGURACION
app.set("port", config.app.port);

//RUTAS
app.use("/api/productores", productores);
app.use("/api/ctn", ctn);
app.use("/api/ingresos", ingresos);
app.use("/api/facturas", facturas);
app.use("/api/detalle", detalle);

module.exports = app;

