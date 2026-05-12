const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://gonzalezsebas1998:sebas123@clustergamemasters.3t5rp.mongodb.net/gamemasters?retryWrites=true&w=majority';

const categories = [
  { name: 'Electrónica', nivel: 1, orden: 1 },
  { name: 'Computación', nivel: 1, orden: 2 },
  { name: 'Gaming', nivel: 1, orden: 3 },
  { name: 'Audio', nivel: 1, orden: 4 },
  { name: 'Periféricos', nivel: 1, orden: 5 },
  { name: 'Smartphones', nivel: 1, orden: 6 },
  { name: 'Accesorios', nivel: 1, orden: 7 },

  { name: 'Televisores', nivel: 2, orden: 1, parent: 'Electrónica' },
  { name: 'Monitores', nivel: 2, orden: 2, parent: 'Electrónica' },
  { name: 'Proyectores', nivel: 2, orden: 3, parent: 'Electrónica' },
  { name: 'Notebooks', nivel: 2, orden: 1, parent: 'Computación' },
  { name: 'PC de Escritorio', nivel: 2, orden: 2, parent: 'Computación' },
  { name: 'Componentes', nivel: 2, orden: 3, parent: 'Computación' },
  { name: 'Impresoras', nivel: 2, orden: 4, parent: 'Computación' },
  { name: 'Sillas Gamer', nivel: 2, orden: 1, parent: 'Gaming' },
  { name: 'Mesas Gamer', nivel: 2, orden: 2, parent: 'Gaming' },
  { name: 'Accesorios Gaming', nivel: 2, orden: 3, parent: 'Gaming' },
  { name: 'Juegos', nivel: 2, orden: 4, parent: 'Gaming' },
  { name: 'Consolas', nivel: 2, orden: 5, parent: 'Gaming' },
  { name: 'Auriculares', nivel: 2, orden: 1, parent: 'Audio' },
  { name: 'Parlantes', nivel: 2, orden: 2, parent: 'Audio' },
  { name: 'Micrófonos', nivel: 2, orden: 3, parent: 'Audio' },
  { name: 'Soundbars', nivel: 2, orden: 4, parent: 'Audio' },
  { name: 'Mouse', nivel: 2, orden: 1, parent: 'Periféricos' },
  { name: 'Teclados', nivel: 2, orden: 2, parent: 'Periféricos' },
  { name: 'Mousepads', nivel: 2, orden: 3, parent: 'Periféricos' },
  { name: 'Webcams', nivel: 2, orden: 4, parent: 'Periféricos' },
  { name: 'Celulares', nivel: 2, orden: 1, parent: 'Smartphones' },
  { name: 'Tablets', nivel: 2, orden: 2, parent: 'Smartphones' },
  { name: 'Smartwatches', nivel: 2, orden: 3, parent: 'Smartphones' },
  { name: 'Cargadores', nivel: 2, orden: 1, parent: 'Accesorios' },
  { name: 'Cables', nivel: 2, orden: 2, parent: 'Accesorios' },
  { name: 'Fundas y Cases', nivel: 2, orden: 3, parent: 'Accesorios' },
  { name: 'Protectores de Pantalla', nivel: 2, orden: 4, parent: 'Accesorios' },
  { name: 'Baterías Externas', nivel: 2, orden: 5, parent: 'Accesorios' },

  { name: 'Mouse Gamer', nivel: 3, orden: 1, parent: 'Mouse' },
  { name: 'Mouse Inalámbrico', nivel: 3, orden: 2, parent: 'Mouse' },
  { name: 'Mouse Ergonómico', nivel: 3, orden: 3, parent: 'Mouse' },
  { name: 'Teclado Mecánico', nivel: 3, orden: 1, parent: 'Teclados' },
  { name: 'Teclado Membrana', nivel: 3, orden: 2, parent: 'Teclados' },
  { name: 'Teclado Inalámbrico', nivel: 3, orden: 3, parent: 'Teclados' },
  { name: 'Procesadores', nivel: 3, orden: 1, parent: 'Componentes' },
  { name: 'Tarjetas Gráficas', nivel: 3, orden: 2, parent: 'Componentes' },
  { name: 'Memorias RAM', nivel: 3, orden: 3, parent: 'Componentes' },
  { name: 'Discos Duros', nivel: 3, orden: 4, parent: 'Componentes' },
  { name: 'Gabinetes', nivel: 3, orden: 5, parent: 'Componentes' },
  { name: 'PlayStation', nivel: 3, orden: 1, parent: 'Consolas' },
  { name: 'Xbox', nivel: 3, orden: 2, parent: 'Consolas' },
  { name: 'Nintendo', nivel: 3, orden: 3, parent: 'Consolas' },
];

async function seed() {
  const mongoose = require('mongoose');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Conectado a MongoDB');

    await Category.deleteMany({});
    console.log('✓ Categorías existentes eliminadas');

    const inserted = {};
    for (const cat of categories) {
      const { parent, ...rest } = cat;
      const doc = new Category(rest);
      const saved = await doc.save();
      inserted[cat.name] = saved._id;
      console.log(`  ✓ [${cat.nivel}] ${cat.name}`);
    }

    for (const cat of categories) {
      if (cat.parent && inserted[cat.parent]) {
        await Category.findByIdAndUpdate(inserted[cat.name], { parentId: inserted[cat.parent] });
        console.log(`  → ${cat.parent} → ${cat.name}`);
      }
    }

    console.log(`\n✅ Seeding completo! ${categories.length} categorías`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
