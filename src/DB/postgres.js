// db/postgres.js
const { Pool } = require('pg');
const format = require('pg-format');
const config = require('../config');

// Crear el pool de conexiones usando la configuración
const pool = new Pool({
  host: config.postgres.host,
  user: config.postgres.user,
  password: config.postgres.password,
  database: config.postgres.database,
  port: config.postgres.port,
  ssl: { rejectUnauthorized: false } // Requerido para conexiones a servicios como Render.com
});

// Manejo de errores del pool (opcional pero recomendado)
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

// Helper para escapar nombres de tabla/columna (solo una definición)
function escapeId(ident) {
  return format('%I', ident);
}

// 🔹 GET TODOS
async function todos(tabla) {
  const sql = `SELECT * FROM ${escapeId(tabla)} ORDER BY id ASC`;
  const res = await pool.query(sql);
  return res.rows;
}


// 🔹 GET UNO
async function uno(tabla, id) {
  const sql = `SELECT * FROM ${escapeId(tabla)} WHERE id = $1`;
  const res = await pool.query(sql, [id]);
  return res.rows[0];
}

// 🔹 INSERT (asume que la tabla tiene una columna 'id' serial/identity)
async function agregar(tabla, data) {
  const keys = Object.keys(data);
  const cols = keys.map(escapeId).join(', ');
  const values = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${escapeId(tabla)} (${cols}) VALUES (${values}) RETURNING id`;
  const res = await pool.query(sql, Object.values(data));
  // Devuelve un objeto similar a mysql2: { insertId: id }
  return { insertId: res.rows[0].id };
}

// 🔹 UPDATE
async function actualizar(tabla, data) {
  if (!data.id) {
    throw new Error('No se proporcionó id para la actualización');
  }
  const keys = Object.keys(data).filter(k => k !== 'id');
  if (keys.length === 0) {
    throw new Error('No hay campos para actualizar');
  }
  const setClause = keys.map((k, i) => `${escapeId(k)} = $${i + 1}`).join(', ');
  const sql = `UPDATE ${escapeId(tabla)} SET ${setClause} WHERE id = $${keys.length + 1}`;
  const values = [...keys.map(k => data[k]), data.id];
  const res = await pool.query(sql, values);
  return res; // Devuelve el objeto result de pg (contiene rowCount, etc.)
}

// 🔹 DELETE
async function eliminar(tabla, id) {
  const sql = `DELETE FROM ${escapeId(tabla)} WHERE id = $1`;
  const res = await pool.query(sql, [id]);
  return res;
}

// 🔹 TRANSACCIONES (usando un cliente del pool)
async function beginTransaction() {
  const client = await pool.connect();
  await client.query('BEGIN');
  return client; // Devolvemos el cliente para usarlo en commit/rollback
}

async function commit(client) {
  await client.query('COMMIT');
  client.release(); // Libera el cliente de vuelta al pool
}

async function rollback(client) {
  await client.query('ROLLBACK');
  client.release();
}

// 🔹 QUERY GENÉRICA
async function query(sql, params = []) {
  const res = await pool.query(sql, params);
  return res.rows;
}

// Exportamos también el pool por si se necesita acceder directamente
module.exports = {
  todos,
  uno,
  agregar,
  actualizar,
  eliminar,
  beginTransaction,
  commit,
  rollback,
  query,
  pool // opcional, para casos avanzados
};