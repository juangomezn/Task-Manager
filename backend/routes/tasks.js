const express = require("express")
const pool = require("../db")

const router = express.Router()

router.patch("/tasks/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { status } = req.body

        if (!status || !["pending", "done"].includes(status)) {
            return res.status(400).json({
                error: "El estado debe ser pending o done"
            })
        }

        const resultado = await pool.query(
            `UPDATE tasks
            SET status = $1
            WHERE id = $2
            RETURNING *`,
            [status, id]
        )

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Tarea no encontrada"
            })
        }

        res.status(200).json(resultado.rows[0])
    } catch (error) {
        console.error("Error al actualizar la tarea", error)

        res.status(500).json({
            error: "Error del servidor"
        })
    }
})

router.delete("/tasks/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)

        const resultado = await pool.query(
            "DELETE FROM tasks WHERE id = $1 RETURNING *",
            [id]
        )

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: "Tarea no encontrada"
            })
        }

        res.status(200).json({
            mensaje: "Tarea eliminada correctamente",
            tarea: resultado.rows[0]
        })
    } catch (error) {
        console.error("Error al eliminar la tarea", error)

        res.status(500).json({
            error: "Error del servidor"
        })
    }
})

module.exports = router