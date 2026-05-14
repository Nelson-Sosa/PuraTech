# ⚡ PuraTech — E-commerce Full Stack MERN

<p align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-4caf50?style=for-the-badge&logo=mongodb&logoColor=47A248&logoWidth=20" alt="Stack: MERN">
  <img src="https://img.shields.io/badge/Status-Production-2196F3?style=for-the-badge" alt="Status: Production">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License: MIT">
</p>

> 🛒 Tienda online profesional de tecnología y electrónica general, desarrollada con arquitectura moderna lista para producción.

## 🚀 Demo en Producción

| Frontend (Vercel) | Backend (Render) |
|-------------------|------------------|
| [`game-masters-nine.vercel.app`](https://game-masters-nine.vercel.app) | [`gamemasters-aqha.onrender.com`](https://gamemasters-aqha.onrender.com) |

---

## 📋 Descripción del Proyecto

**PuraTech** es una aplicación web full-stack de comercio electrónico especializada en productos de tecnología y electrónica general (computación, gaming, audio, smartphones, periféricos y más). El proyecto implementa patrones de arquitectura empresarial incluyendo autenticación segura, control de acceso basado en roles, gestión de inventario, y un sistema de categorías jerárquico de 3 niveles estilo grandes plataformas como Amazon y MercadoLibre.

### ✨ Características Principales

| Categoría | Funcionalidades |
|-----------|-----------------|
| **🛍️ E-commerce** | Catálogo de productos, búsqueda avanzada, filtros por categoría, carrito de compras |
| **👥 Autenticación** | JWT con refresh token, login/registro, recuperación de contraseña |
| **⚙️ Administración** | Panel admin completo: productos, categorías, pedidos, clientes, inventario |
| **📁 Categorías** | Sistema jerárquico de 3 niveles (padre → hijo → nieto) estilo Amazon/MercadoLibre |
| **📱 UX/UI** | Diseño responsive, tema claro profesional, animaciones fluidas |
| **📦 Pedidos** | Integración con WhatsApp para pedidos, gestión de estado de órdenes |
| **🖼️ Imágenes** | Cloudinary para almacenamiento y optimización de imágenes |


---

## 🛠️ Stack Tecnológico

### Frontend
```
React 18 + React Router 6
├── Axios (HTTP client)
├── JWT Decode (token handling)
├── Framer Motion (animaciones)
└── Tailwind CSS + NextUI (UI components)
```

### Backend
```
Node.js + Express.js
├── MongoDB + Mongoose (base de datos)
├── JWT + bcryptjs (autenticación)
├── Cloudinary + Multer (imágenes)

```

### Infraestructura & Despliegue
```
Frontend:  Vercel (CDN global)
Backend:  Render (Node.js server)
Database: MongoDB Atlas (cloud)
Imágenes: Cloudinary CDN
```

---

## 🏗️ Arquitectura del Proyecto

```
PuraTech/
├── 📁 client/                 # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── Navbar/       # Navegación con dropdown categorías
│   │   │   ├── ProductCard/  # Tarjetas de producto
│   │   │   ├── ProtectedRoute/
│   │   │   └── ...
│   │   ├── pages/            # Páginas principales
│   │   │   ├── Home/        # Homepage con hero y categorías
│   │   │   ├── Products/    # Catálogo de productos
│   │   │   ├── Product/     # Detalle de producto
│   │   │   ├── Cart/        # Carrito de compras
│   │   │   ├── Login/       # Autenticación
│   │   │   ├── Admin/       # Panel de administración
│   │   │   └── ...
│   │   ├── context/         # React Context (Carrito, Auth)
│   │   ├── config/          # Configuración API
│   │   └── App.jsx          # Router principal
│   └── package.json
│
├── 📁 server/                # Backend Express
│   ├── controllers/          # Lógica de negocio
│   │   ├── ProductController.js
│   │   ├── CategoryController.js
│   │   ├── UserController.js
│   │   ├── OrderController.js
│   │   └── SuppliersController.js
│   ├── routes/              # Definición de endpoints
│   ├── models/              # Modelos Mongoose
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── User.js
│   │   ├── Order.js
│   │   └── Supplier.js
│   ├── middlewares/         # Autenticación y validación
│   │   └── authMiddleware.js
│   ├── config/              # Configuración (Cloudinary, DB)
│   ├── server.js            # Punto de entrada
│   └── package.json
│
└── README.md                # Este archivo
```

---

## 🔌 Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/register` | Registro de usuario |
| POST | `/api/login` | Inicio de sesión |
| GET | `/api/verify-token` | Validar token JWT |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar productos (público) |
| GET | `/api/products/:categoria` | Filtrar por categoría |
| GET | `/api/product/:id` | Detalle de producto |
| POST | `/api/agregar/product` | Crear producto (admin) |
| PUT | `/api/actualizar/product/:id` | Actualizar producto (admin) |
| DELETE | `/api/remover/product/:id` | Eliminar producto (admin) |

### Categorías
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories` | Listar todas (plano) |
| GET | `/api/categories/tree` | Árbol jerárquico |
| GET | `/api/categories/main` | Solo categorías principales |
| POST | `/api/categories` | Crear categoría (admin) |
| PUT | `/api/categories/:id` | Actualizar categoría (admin) |
| DELETE | `/api/categories/:id` | Eliminar categoría (admin) |

### Órdenes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/orders` | Listar pedidos (admin) |
| POST | `/api/orders` | Crear pedido |
| PUT | `/api/orders/:id/status` | Actualizar estado (admin) |

---

## 🎨 Sistema de Categorías Jerárquico

El proyecto implementa un sistema de categorías de 3 niveles inspirado en grandes plataformas como Amazon y MercadoLibre:

```
📂 Electrónica      (Nivel 1)
├── 📁 Televisores
├── 📁 Monitores
└── 📁 Proyectores

📂 Computación      (Nivel 1)
├── 📁 Notebooks
│   ├── 📄 Notebooks Gamer
│   └── 📄 Notebooks Tradicionales
├── 📁 PC de Escritorio
│   ├── 📄 PC Gamer
│   └── 📄 PC Tradicional
├── 📁 Componentes
│   ├── 📄 Procesadores
│   ├── 📄 Tarjetas Gráficas
│   ├── 📄 Memorias RAM
│   └── 📄 Gabinetes
├── 📁 Monitores
└── 📁 Impresoras

📂 Gaming           (Nivel 1)
├── 📁 Consolas
│   ├── 📄 PlayStation
│   ├── 📄 Xbox
│   └── 📄 Nintendo
├── 📁 Sillas Gamer
├── 📁 Mesas Gamer
└── 📁 Accesorios Gaming

📂 Audio            (Nivel 1)
├── 📁 Auriculares
├── 📁 Parlantes
├── 📁 Micrófonos
└── 📁 Soundbars

📂 Periféricos      (Nivel 1)
├── 📁 Mouse
│   ├── 📄 Mouse Gamer
│   ├── 📄 Mouse Inalámbrico
│   └── 📄 Mouse Ergonómico
├── 📁 Teclados
│   ├── 📄 Teclado Mecánico
│   └── 📄 Teclado Inalámbrico
├── 📁 Mousepads
└── 📁 Webcams

📂 Smartphones     (Nivel 1)
├── 📁 Celulares
│   ├── 📄 Samsung
│   ├── 📄 iPhone
│   └── 📄 Xiaomi
├── 📁 Tablets
└── 📁 Smartwatches

📂 Accesorios      (Nivel 1)
├── 📁 Cargadores
├── 📁 Cables
├── 📁 Fundas y Cases
└── 📁 Baterías Externas
```

---

## 🚦 Control de Acceso (RBAC)

| Rol | Permisos |
|-----|----------|
| **Usuario** | Ver productos, agregar al carrito, realizar pedidos |
| **Admin** | CRUD completo de productos, categorías, pedidos, clientes, inventario |

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm o yarn
- Cuenta MongoDB Atlas
- Cuenta Cloudinary
- Cuenta Stripe (dev)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Nelson-Sosa/PuraTech.git
cd PuraTech

# 2. Instalar dependencias del root
npm install

# 3. Instalar frontend
cd client && npm install

# 4. Instalar backend
cd ../server && npm install
```

### Configuración

Crear archivo `.env` en `/server/`:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_jwt_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Ejecutar en desarrollo

```bash
# Terminal 1 - Backend (puerto 5000)
cd server && npm start

# Terminal 2 - Frontend (puerto 3000)
cd client && npm start
```

---

## 📊 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Commits | 30+ |
| Ramas | main + feature branches |
| Frameworks | 5 (React, Express, MongoDB, Tailwind, NextUI) |
| Endpoints API | 20+ |
| Componentes React | 25+ |
| Páginas | 15+ |

---

## 🔮 Funcionalidades Futuras

- [ ] Dashboard de análisis de ventas (admin)
- [ ] Reseñas y calificaciones de productos
- [ ] Lista de deseos / favoritos
- [ ] Comparador de productos
- [ ] Chat de soporte con IA
- [ ] Programa de puntos/rewards
- [ ] Multi-idioma (ES/EN)

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Nelson Sosa** — Desarrollador Full Stack

[![GitHub](https://img.shields.io/badge/GitHub-nelsonsosa-black?style=flat&logo=github)](https://github.com/Nelson-Sosa)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nelson_Sosa-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/nelson-sosa-b9b901398/?skipRedirect=true)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Contact-green?style=flat&logo=whatsapp)](https://wa.me/595983986775)

---

<p align="center">
  <sub>Construido con ❤️ usando MERN Stack</sub>
</p>
