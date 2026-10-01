const express = require("express")
const pool = require("./db")
const cors = require("cors")

const projectsRoutes = require("./routes/projects")
const tasksRoutes = require("./routes/tasks")

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.use(projectsRoutes)
app.use(tasksRoutes)

pool.query("SELECT NOW()", (error, resultado) => {
    if (error) {
        console.error("Error al conectarse a la DB", error)
    } else {
        console.log("Conexion exitosa", resultado.rows)
    }
})

app.listen(PORT, () => {
    console.log(`Ejecutandose en http://localhost:${PORT}`)
})