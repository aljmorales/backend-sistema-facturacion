//npm i mysql
const mysql = require("mysql");
const config = require("../config");

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
};

let conexion;

function conMysql() {
    conexion = mysql.createConnection(dbconfig);

    conexion.connect((err) => {
        if (err) {
            console.log("[db err]", err);
            setTimeout(conMysql, 200);
        } else {
            console.log("DB Conectada!!!");
        }
    });

    conexion.on("error", (err) => {
        console.log("[db err]", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            conMysql();
        } else {
            throw err;
        }
    });
}

conMysql();

// 🔹 GET TODOS
function todos(tabla) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ??`, [tabla], (err, result) => {
            return err ? reject(err) : resolve(result);
        });
    });
}

// 🔹 GET UNO
function uno(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ?? WHERE id = ?`, [tabla, id], (err, result) => {
            return err ? reject(err) : resolve(result[0]);
        });
    });
}

// 🔹 INSERT
function agregar(tabla, data) {
    return new Promise((resolve, reject) => {
        conexion.query(`INSERT INTO ?? SET ?`, [tabla, data], (err, result) => {
            return err ? reject(err) : resolve(result);
        });
    });
}

// 🔹 UPDATE
function actualizar(tabla, data) {
    return new Promise((resolve, reject) => {
        conexion.query(
            `UPDATE ?? SET ? WHERE id = ?`,
            [tabla, data, data.id],
            (err, result) => {
                return err ? reject(err) : resolve(result);
            }
        );
    });
}

// 🔹 DELETE
function eliminar(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(
            `DELETE FROM ?? WHERE id = ?`,
            [tabla, id],
            (err, result) => {
                return err ? reject(err) : resolve(result);
            }
        );
    });
}

function beginTransaction() {
    return new Promise((resolve, reject) => {
        conexion.beginTransaction(err => {
            return err ? reject(err) : resolve();
        });
    });
}

function commit() {
    return new Promise((resolve, reject) => {
        conexion.commit(err => {
            return err ? reject(err) : resolve();
        });
    });
}

function rollback() {
    return new Promise((resolve, reject) => {
        conexion.rollback(() => resolve());
    });
}

function query(sql, params) {
    return new Promise((resolve, reject) => {
        conexion.query(sql, params, (err, result) => {
            return err ? reject(err) : resolve(result);
        });
    });
}

module.exports = {
    todos,
    uno,
    agregar,
    actualizar,
    eliminar,
    beginTransaction,
    commit,
    rollback,
    query
};