# Task Manager

Aplicación web para gestionar proyectos y tareas.

## Tecnologías

- React + Vite
- Node.js + Express
- PostgreSQL

## Requisitos

Tener instalado:

- Node.js
- PostgreSQL

## 1. Base de datos

Crear una base de datos en PostgreSQL llamada:

```text
task_manager
```

Ejecutar el archivo SQL del proyecto para crear las tablas y cargar los datos de prueba.

## 2. Backend

Abrir una terminal en la carpeta `backend`:

```bash
cd backend
npm install
node server.js
```

El backend quedará disponible en:

```text
http://localhost:3000
```

Antes de ejecutarlo, verificar en `db.js` los datos de conexión a PostgreSQL:

```javascript
const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "TU_PASSWORD",
    database: "task_manager"
})
```

## 3. Frontend

Abrir otra terminal en la carpeta `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Vite mostrará la dirección para acceder a la aplicación, normalmente:

```text
http://localhost:5173
```

## 4. Funcionamiento

Desde la aplicación se pueden:

- Crear proyectos.
- Seleccionar proyectos.
- Crear tareas.
- Marcar tareas como completadas.
- Eliminar tareas.

El frontend se comunica con el backend mediante una API REST y el backend almacena la información en PostgreSQL.

## Orden para ejecutar

1. Iniciar PostgreSQL.
2. Crear la base de datos `task_manager`.
3. Ejecutar el script SQL.
4. Iniciar el backend con `node server.js`.
5. Iniciar el frontend con `npm run dev`.
6. Abrir la dirección indicada por Vite en el navegador.