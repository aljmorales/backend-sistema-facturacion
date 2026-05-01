const TABLA = "facturas";

module.exports = function(dbInyectada) {
    let db = dbInyectada;

    if (!db) {
        // Cambia la ruta al módulo de PostgreSQL (ajusta el nombre si es necesario)
        db = require("../../DB/postgres");
    }

    function todos() {
        return db.todos(TABLA);
    }

    function uno(id) {
        return db.uno(TABLA, id);
    }

    async function agregar(body) {
        const { detalles, ...factura } = body;
        // Insertar cabecera
        const resultado = await db.agregar(TABLA, factura);
        // Para PostgreSQL, el objeto resultado contiene la propiedad 'id' (RETURNING id)
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

            // 2. eliminar detalles antiguos (PostgreSQL usa $1 en lugar de ?)
            await db.query(
                "DELETE FROM detalle_factura WHERE factura_id = $1",
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

    function eliminar(id) {
        return db.eliminar(TABLA, id);
    }

    function obtenerDetalles(facturaId) {
        // También aquí se cambia ? por $1
        return db.query("SELECT * FROM detalle_factura WHERE factura_id = $1", [facturaId]);
    }

    return {
        todos,
        uno,
        agregar,
        actualizar,
        eliminar,
        obtenerDetalles
    };
};