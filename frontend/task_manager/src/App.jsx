import { useEffect, useRef, useState } from "react"
import "./App.css"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    console.error("Error del servidor:", response.status, data)

    throw new Error(
      data?.error ||
      data?.message ||
      `El servidor respondió con el error ${response.status}.`
    )
  }

  return data
}

function App() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [tasks, setTasks] = useState([])

  const [projectName, setProjectName] = useState("")
  const [title, setTitle] = useState("")

  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [creatingProject, setCreatingProject] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const [busyTaskId, setBusyTaskId] = useState(null)
  const [leavingId, setLeavingId] = useState(null)

  const [error, setError] = useState("")

  const selectedIdRef = useRef(null)
  const selectedId = selectedProject?.id

  useEffect(() => {
    const controller = new AbortController()

    request("/projects", { signal: controller.signal })
      .then(setProjects)
      .catch(err => {
        if (err.name !== "AbortError") {
          setError("No se pudieron cargar los proyectos. Revisa que el servidor esté activo.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingProjects(false)
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (selectedId == null) return

    const controller = new AbortController()
    setTasks([])
    setLoadingTasks(true)

    request(`/projects/${selectedId}/tasks`, { signal: controller.signal })
      .then(setTasks)
      .catch(err => {
        if (err.name !== "AbortError") {
          setError("No se pudieron cargar las tareas.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingTasks(false)
      })

    return () => controller.abort()
  }, [selectedId])

  const selectProject = (project) => {
    selectedIdRef.current = project.id
    setSelectedProject(project)
    setTitle("")
    setError("")
  }

  const createProject = async (event) => {
    event.preventDefault()

    const name = projectName.trim()
    if (!name) {
      setError("Escribe un nombre para el proyecto.")
      return
    }

    setCreatingProject(true)

    try {
      const project = await request("/projects", {
        method: "POST",
        body: JSON.stringify({ name })
      })

      setProjects(prev => [...prev, project])
      setProjectName("")
      selectProject(project)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreatingProject(false)
    }
  }

  const createTask = async (event) => {
    event.preventDefault()

    const taskTitle = title.trim()
    if (!taskTitle) return

    const projectId = selectedProject.id
    setCreatingTask(true)

    try {
      const newTask = await request(`/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ title: taskTitle })
      })

      if (selectedIdRef.current === projectId) {
        setTasks(prev => [...prev, newTask])
        setTitle("")
      }
      setError("")
    } catch (err) {
      setError(err.message)
    } finally {
      setCreatingTask(false)
    }
  }

  const toggleTask = async (task) => {
    const nextStatus = task.status === "done" ? "pending" : "done"
    setBusyTaskId(task.id)

    try {
      const updated = await request(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      })

      setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)))
      setError("")
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyTaskId(null)
    }
  }

  const deleteTask = async (task) => {
    if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) return

    setBusyTaskId(task.id)

    try {
      await request(`/tasks/${task.id}`, { method: "DELETE" })

      setLeavingId(task.id)
      await new Promise(resolve => setTimeout(resolve, 200))

      setTasks(prev => prev.filter(t => t.id !== task.id))
      setLeavingId(null)
      setError("")
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyTaskId(null)
    }
  }

  const completedCount = tasks.filter(task => task.status === "done").length
  const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0

  if (loadingProjects) {
    return (
      <div className="app">
        <p className="loading" role="status">Cargando proyectos…</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>Mis proyectos</h1>
        <p>Elige un proyecto para ver y organizar sus tareas.</p>
      </header>

      {error && (
        <div className="error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            Cerrar
          </button>
        </div>
      )}

      <div className="layout">
        <aside className="sidebar">
          <form className="inline-form" onSubmit={createProject}>
            <label htmlFor="project-name" className="sr-only">
              Nombre del proyecto
            </label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Nuevo proyecto"
              autoComplete="off"
            />
            <button type="submit" disabled={creatingProject}>
              {creatingProject ? "Creando…" : "Crear"}
            </button>
          </form>

          {projects.length === 0 ? (
            <p className="hint">
              Todavía no tienes proyectos. Crea el primero con el campo de arriba.
            </p>
          ) : (
            <ul className="project-list">
              {projects.map(project => (
                <li key={project.id}>
                  <button
                    type="button"
                    className="project-item"
                    aria-current={selectedId === project.id ? "true" : undefined}
                    onClick={() => selectProject(project)}
                  >
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="content">
          {!selectedProject ? (
            <div className="empty">
              <h2>Elige un proyecto</h2>
              <p>Selecciona uno de la lista para ver sus tareas.</p>
            </div>
          ) : (
            <section
              key={selectedProject.id}
              className="panel"
              aria-labelledby="project-title"
            >
              <div className="content-header">
                <h2 id="project-title">{selectedProject.name}</h2>
                <p>
                  {tasks.length === 0
                    ? "Aún no hay tareas"
                    : `${completedCount} de ${tasks.length} completadas`}
                </p>
                {tasks.length > 0 && (
                  <div className="progress" aria-hidden="true">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>

              <form className="inline-form" onSubmit={createTask}>
                <label htmlFor="task-title" className="sr-only">
                  Título de la tarea
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="¿Qué necesitas hacer?"
                  autoComplete="off"
                />
                <button type="submit" disabled={creatingTask || !title.trim()}>
                  {creatingTask ? "Agregando…" : "Agregar"}
                </button>
              </form>

              {loadingTasks ? (
                <p className="hint" role="status">Cargando tareas…</p>
              ) : tasks.length === 0 ? (
                <div className="empty">
                  <h3>No hay tareas todavía</h3>
                  <p>Escribe una arriba y presiona Agregar.</p>
                </div>
              ) : (
                <ul className="task-list">
                  {tasks.map(task => {
                    const isDone = task.status === "done"

                    return (
                      <li
                        key={task.id}
                        className={
                          leavingId === task.id ? "task-item leaving" : "task-item"
                        }
                      >
                        <label className={isDone ? "task-label done" : "task-label"}>
                          <input
                            type="checkbox"
                            checked={isDone}
                            disabled={busyTaskId === task.id}
                            onChange={() => toggleTask(task)}
                          />
                          <span>{task.title}</span>
                        </label>

                        <button
                          type="button"
                          className="link-button"
                          disabled={busyTaskId === task.id}
                          onClick={() => deleteTask(task)}
                          aria-label={`Eliminar la tarea ${task.title}`}
                        >
                          Eliminar
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App