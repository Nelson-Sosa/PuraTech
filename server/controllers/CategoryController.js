const Category = require("../models/Category");

// Helper: Generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[áéíóúüñ]/g, match => {
      const map = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n' };
      return map[match];
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Traer todas las categorías (formato plano - retrocompatible)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ nivel: 1, orden: 1, name: 1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Traer árbol de categorías (jerárquico)
const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ nivel: 1, orden: 1, name: 1 });
    
    // Build tree structure
    const buildTree = (parentId = null) => {
      return categories
        .filter(cat => {
          if (parentId === null) return cat.parentId === null;
          return cat.parentId?.toString() === parentId.toString();
        })
        .map(cat => ({
          ...cat.toObject(),
          children: buildTree(cat._id)
        }));
    };
    
    const tree = buildTree();
    res.status(200).json(tree);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Traer subcategorías de una categoría
const getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;
    const categories = await Category.find({ 
      parentId: parentId,
      isActive: true 
    }).sort({ orden: 1, name: 1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Traer categorías principales (nivel 1)
const getMainCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      parentId: null,
      isActive: true 
    }).sort({ orden: 1, name: 1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Agregar nueva categoría
const addCategory = async (req, res) => {
  try {
    const { name, description, image, parentId, orden } = req.body;
    
    if (!name) return res.status(400).json({ mensaje: "El nombre es requerido" });
    
    // Check if name already exists at same level
    const nameExists = await Category.findOne({ 
      name: name.trim(),
      parentId: parentId || null
    });
    if (nameExists) return res.status(400).json({ mensaje: "Categoría ya existe en este nivel" });
    
    // Calculate nivel based on parent
    let nivel = 1;
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ mensaje: "Categoría padre no encontrada" });
      if (parent.nivel >= 3) return res.status(400).json({ mensaje: "Máximo 3 niveles de profundidad" });
      nivel = parent.nivel + 1;
    }
    
    const slug = generateSlug(name);
    
    // Ensure slug is unique
    let slugExists = await Category.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }
    
    const category = new Category({
      name: name.trim(),
      slug,
      description: description || '',
      image: image || '',
      parentId: parentId || null,
      nivel,
      orden: orden || 0
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
  try {
    const { name, description, image, parentId, orden, isActive } = req.body;
    const categoryId = req.params.id;
    
    if (!name) return res.status(400).json({ mensaje: "El nombre es requerido" });
    
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ mensaje: "Categoría no encontrada" });
    
    // Check if new parent is valid (can't be self or descendant)
    if (parentId) {
      if (parentId === categoryId) {
        return res.status(400).json({ mensaje: "Una categoría no puede ser su propio padre" });
      }
      
      // Check if new parent is a descendant
      const isDescendant = await checkIsDescendant(parentId, categoryId);
      if (isDescendant) {
        return res.status(400).json({ mensaje: "No puedes mover una categoría bajo una de sus subcategorías" });
      }
    }
    
    // Calculate new nivel
    let nivel = 1;
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ mensaje: "Categoría padre no encontrada" });
      nivel = parent.nivel + 1;
    }
    
    // Check slug uniqueness
    const newSlug = generateSlug(name);
    const slugExists = await Category.findOne({ 
      slug: newSlug, 
      _id: { $ne: categoryId } 
    });
    
    const updates = {
      name: name.trim(),
      slug: slugExists ? `${newSlug}-${Date.now()}` : newSlug,
      description: description || '',
      image: image || '',
      parentId: parentId || null,
      nivel,
      orden: orden || 0
    };
    
    if (isActive !== undefined) {
      updates.isActive = isActive;
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true }
    );
    
    // Update nivel of all descendants
    await updateDescendantsNivel(categoryId, nivel + 1);
    
    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Helper: Check if targetId is a descendant of ancestorId
const checkIsDescendant = async (targetId, ancestorId) => {
  const category = await Category.findById(targetId);
  if (!category || !category.parentId) return false;
  if (category.parentId.toString() === ancestorId) return true;
  return checkIsDescendant(category.parentId, ancestorId);
};

// Helper: Update nivel of all descendants
const updateDescendantsNivel = async (parentId, nivel) => {
  const children = await Category.find({ parentId });
  for (const child of children) {
    await Category.findByIdAndUpdate(child._id, { nivel });
    await updateDescendantsNivel(child._id, nivel + 1);
  }
};

// Eliminar categoría
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if has children
    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren) {
      return res.status(400).json({ 
        mensaje: "No puedes eliminar una categoría que tiene subcategorías. Elimina las subcategorías primero." 
      });
    }
    
    await Category.findByIdAndDelete(id);
    res.json({ mensaje: "Categoría eliminada" });
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Eliminar categoría y reasignar hijos
const deleteCategoryAndReassign = async (req, res) => {
  try {
    const { id } = req.params;
    const { newParentId } = req.body;
    
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ mensaje: "Categoría no encontrada" });
    
    // Move children to new parent
    if (newParentId) {
      const newParent = await Category.findById(newParentId);
      if (!newParent) return res.status(400).json({ mensaje: "Categoría padre destino no encontrada" });
      
      const newNivel = newParent.nivel + 1;
      await Category.updateMany(
        { parentId: id },
        { parentId: newParentId, nivel: newNivel }
      );
      
      // Update descendants nivel
      await updateDescendantsNivel(newParentId, newNivel + 1);
    }
    
    await Category.findByIdAndDelete(id);
    res.json({ mensaje: "Categoría eliminada" });
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

// Obtener categoría por ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ mensaje: "Categoría no encontrada" });
    
    // Get children
    const children = await Category.find({ parentId: category._id }).sort({ orden: 1, name: 1 });
    
    res.json({
      ...category.toObject(),
      children
    });
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
};

module.exports = {
  getCategories,
  getCategoryTree,
  getSubcategories,
  getMainCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  deleteCategoryAndReassign,
  getCategoryById
};