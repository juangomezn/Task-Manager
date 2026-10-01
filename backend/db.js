const { Pool } = require("pg")

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "Juan190805.",
    database: "task_manager"
})

module.exports = pool