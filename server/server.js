const express = require('express');
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

const RoutesUser = require('./routes/routes');

require('./configuration/configuration.mongoose');

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));



RoutesUser(app);

app.listen(PORT, () => {
    console.log(`El servidor se está ejecutando en el puerto: ${PORT}`);
});