const express = require("express")
const pool = require("../db")

const router = express.Router()

router.get("/projects", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM projects"
        )

        res.status(200).json(resultado.rows)
    } catch (error) {
        console.error("Error al obtener los proyectos", error)

        res.status(500).json({
            error: "Error del servidor"
        })
    }
})

router.post("/projects", async (req, res) => {
    try {
        const { name } = req.body

        if (!name || name.trim() === "") {
            return res.status(400).json({
                error: "El nombre del proyecto es obligatorio"
            })
        }

        const resultado = await pool.query(
            `INSERT INTO projects (name)
            VALUES ($1)
            RETURNING *`,
            [name.trim()]
        )

        res.status(201).json(resultado.rows[0])
    } catch (error) {
        console.error("Error al crear el proyecto", error)

        res.status(500).json({
            error: "Error del servidor"
        })
    }
})

router.get("/projects/:id/tasks", async (req, res) => {
    try {
        const id = Number(req.params.id)

        const proyecto = await pool.query(
            "SELECT id FROM projects WHERE id = $1",
            [id]
        )

        if (proyecto.rows.length === 0) {
            return res.status(404).json({
                error: "Proyecto no encontrado"
            })
        }

        const resultado = await pool.query(
            `SELECT
                t.id,
                t.title,
                t.status,
                p.name AS project_name
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.id = $1
            ORDER BY t.id`,
            [id]
        )

        res.status(200).json(resultado.rows)
    } catch (error) {
        console.error("Error al obtener las tareas", error)

        res.status(500).json({
            error: "Error del servidor"
        })
    }
})

router.post("/projects/:id/tasks", async (req, res) => {
    try {
        const projectId = Number(req.params.id)
        const { title } = req.body

        if (!title || title.trim() === "") {
            return res.status(400).json({
                error: "El titulo es obligatorio"
            })
        }

        const proyecto = await pool.query(
            "SELECT id FROM projects WHERE id = $1",
            [projectId]
        )

        if (proyecto.rows.length === 0) {
            return res.status(404).json({
                error: "Proyecto no encontrado"
            })
        }

        const resultado = await pool.query(
            `INSERT INTO tasks (title, status, project_id)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [title.trim(), "pending", projectId]
        )

        res.status(201).json(resultado.rows[0])
    } catch (error) {
        console.error("Error al crear la tarea", error)

        res.status(500).json({
            error: "Error del servidor"
        })
    }
})

module.exports = router