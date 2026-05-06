const Category = require("../models/Category");

// Traer todas las categorías
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Agregar nueva categoría
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ mensaje: "El nombre es requerido" });

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) return res.status(400).json({ mensaje: "Categoría ya existe" });

    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ mensaje: "El nombre es requerido" });

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Eliminar categoría
const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Categoría eliminada" });
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

module.exports = {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory
};