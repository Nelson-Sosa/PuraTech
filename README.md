🎮 GameMasters – Aplicación Full Stack MERN

🌐 Demo en producción: https: https://gamemasters-aqha.onrender.com

📌 Descripción

GameMasters es una aplicación web Full Stack tipo e-commerce desarrollada con el stack MERN (MongoDB, Express, React, Node.js).

Implementa autenticación segura con JWT, autorización basada en roles (RBAC), integración con servicios externos (Cloudinary y Stripe) y una arquitectura modular preparada para entorno de producción.

🚀 Funcionalidades

🔐 Autenticación con JWT

👥 Control de acceso basado en roles (Admin / Usuario)

🛍 CRUD completo de productos

🏷 Gestión de categorías

🚚 Gestión de proveedores

🖼 Subida de imágenes con Cloudinary

💳 Integración de pagos con Stripe

🔎 Búsqueda global de productos

📦 Backend sirviendo build de React en producción

🛠 Stack Tecnológico
🔹 Frontend

React.js

React Router DOM

Axios

Hooks (useState, useEffect)

Manejo de FormData (multipart/form-data)

Arquitectura basada en componentes

UI responsive

🔹 Backend

Node.js

Express.js

MongoDB

Mongoose (ODM)

Diseño de API RESTful

JWT Authentication

Middleware personalizado

Role-Based Access Control (RBAC)

Cloudinary (gestión de imágenes)

Stripe API (procesamiento de pagos)

Variables de entorno (.env)

Manejo de errores HTTP (400, 401, 403)

🏗 Arquitectura del Proyecto

Estructura organizada por capas siguiendo buenas prácticas:

GameMasters/
│
├── server/
│   ├── controllers/      # Lógica de negocio
│   ├── routes/           # Definición de endpoints
│   ├── middlewares/      # Autenticación y autorización
│   ├── models/           # Esquemas de MongoDB (Mongoose)
│   ├── configuration/    # Configuración de DB y servicios externos
│   └── server.js         # Punto de entrada del backend
│
├── client/
│   ├── components/       # Componentes reutilizables
│   ├── pages/            # Vistas principales
│   ├── config/           # Configuración (API_URL)
│   └── App.js
│
└── README.md
