const TABLA = "facturas";

module.exports = function(dbInyectada){

    let db = dbInyectada;

    if(!db){
        db = require("../../DB/mysql");
    }

    function todos(){
        return db.todos(TABLA);
    }

    function uno(id){
        return db.uno(TABLA, id);
    }

    async function agregar(body) {
        const { detalles, ...factura } = body;
        // Insertar cabecera
        const resultado = await db.agregar(TABLA, factura);
        const facturaId = resultado.insertId;
        
        // Insertar detalles
        for (let i = 0; i < detalles.length; i++) {
            const item = detalles[i];
            const { id, ...detalleSinId } = item;
            
            const detalleParaDB = {
                ...detalleSinId,
                factura_id: facturaId
            };
            
            console.log(`📄 Detalle ${i} a insertar:`, detalleParaDB);
            
            await db.agregar("detalle_factura", detalleParaDB);
        }
        
        return resultado;
    }


    async function actualizar(id, body) {
        const { detalles, ...factura } = body;

        try {
            await db.beginTransaction();

            // 1. actualizar factura
            await db.actualizar(TABLA, { ...factura, id });

            // 2. eliminar detalles antiguos
            await db.query(
                "DELETE FROM detalle_factura WHERE factura_id = ?",
                [id]
            );

            // 3. insertar nuevos detalles
            for (let item of detalles) {
                const { id: _, ...detalle } = item;

                await db.agregar("detalle_factura", {
                    ...detalle,
                    factura_id: id
                });
            }

            await db.commit();
            return { mensaje: "Factura actualizada con detalles" };

        } catch (error) {
            await db.rollback();
            throw error;
        }
    }

    function eliminar(id){
        return db.eliminar(TABLA, id);
    }

    function obtenerDetalles(facturaId) {
        return db.query("SELECT * FROM detalle_factura WHERE factura_id = ?", [facturaId]);
    }

    return{
        todos,
        uno,
        agregar,
        actualizar,
        eliminar,
        obtenerDetalles
    }
}