//npm i dotenv -D
module.exports = {
    app: {
        port: process.env.PORT || 5000
    },
    jwt: {
        secret: process.env.JET_SECRET || "notasecreta"
    },
    postgres: {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT
    }
};
