const TABLA = "ctn";

module.exports = function(dbInyectada){

    let db = dbInyectada;

    if(!db){
        db = require("../../DB/postgres");
    }

    function todos(){
        return db.todos(TABLA);
    }

    function uno(id){
        return db.uno(TABLA, id);
    }

    function agregar(body){
        return db.agregar(TABLA, body);
    }

    function actualizar(id, body){
        const data = { ...body, id }; // 👈 AQUÍ ESTÁ LA MAGIA
        return db.actualizar(TABLA, data);
    }

    function eliminar(id){
        return db.eliminar(TABLA, id);
    }

    return{
        todos,
        uno,
        agregar,
        actualizar,
        eliminar,
    }
}