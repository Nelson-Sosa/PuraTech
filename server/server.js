const express = require('express');
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;

// Orígenes siempre permitidos (hardcoded como fallback robusto)
const HARDCODED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://puratech-store.vercel.app",
  "https://game-masters-nine.vercel.app",  // dominio anterior (compatibilidad)
  "https://gamemasters-aqha.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Verificar en la lista hardcoded
    if (HARDCODED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // Verificar orígenes extra definidos en variable de entorno
    if (process.env.ALLOWED_ORIGINS) {
      const envOrigins = process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim());
      if (envOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    // Permitir cualquier subdominio de vercel.app (para previews de PR, etc.)
    if (/\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

const RoutesUser = require('./routes/routes');

require('./configuration/configuration.mongoose');

// Manejar preflight OPTIONS antes de cualquier otra cosa
app.options('*', cors(corsOptions));

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

RoutesUser(app);

app.listen(PORT, () => {
    console.log(`El servidor se está ejecutando en el puerto: ${PORT}`);
});