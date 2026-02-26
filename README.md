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

## 🏗 Arquitectura del Proyecto

```text
GameMasters/
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── models/
│   ├── configuration/
│   └── server.js
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── config/
│   └── App.js
│
└── README.md
```
🔐 Seguridad

Autenticación con JSON Web Tokens

Protección de rutas mediante middleware

Role-Based Access Control (RBAC)

Manejo seguro de variables de entorno

Control de errores HTTP estructurado

☁️ Integraciones Externas

🖼 Cloudinary

Almacenamiento escalable

Optimización automática de imágenes

Independencia del servidor físico

💳 Stripe

Creación de Payment Intents

Comunicación segura backend → Stripe

Preparado para entorno real
