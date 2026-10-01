CREATE TABLE projects (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE tasks (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(150) NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'in_progress', 'done')),
    project_id INT NOT NULL,
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE
);

-- 2. Datos de prueba
INSERT INTO projects (name) VALUES
    ('Gestor de Gastos'),
    ('Gestor de Gimnasio'),
    ('Proyecto sin tareas');

INSERT INTO tasks (title, status, project_id) VALUES
    ('Diseñar modelo de base de datos', 'done',        1),
    ('Crear endpoints REST',            'in_progress', 1),
    ('Implementar autenticación',       'pending',     1),
    ('Definir roles de usuario',        'done',        2),
    ('Registrar pagos de mensualidad',  'in_progress', 2);

-- 3. Consultas

-- 3.1 INNER JOIN: cada tarea con el nombre de su proyecto
SELECT p.name AS project, t.title, t.status
FROM projects p
INNER JOIN tasks t ON t.project_id = p.id
ORDER BY p.name, t.id;

-- 3.2 LEFT JOIN: todos los proyectos, incluso los que no tienen tareas
SELECT p.name AS project, t.title, t.status
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
ORDER BY p.name, t.id;

-- 3.3 Cantidad de tareas por proyecto
SELECT p.name AS project, COUNT(t.id) AS total_tasks
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
GROUP BY p.id, p.name
ORDER BY total_tasks DESC;

-- 3.4 Tareas pendientes de un proyecto específico
SELECT t.id, t.title, t.status
FROM tasks t
INNER JOIN projects p ON p.id = t.project_id
WHERE p.name = 'Gestor de Gastos'
  AND t.status <> 'done';

-- 3.5 Subconsulta: proyectos que tienen al menos una tarea terminada
SELECT name
FROM projects
WHERE id IN (SELECT project_id FROM tasks WHERE status = 'done');