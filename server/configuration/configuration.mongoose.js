const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Conectado a MongoDB Atlas"))
    .catch(err => console.log("❌ Error al conectarse a la base de datos", err));