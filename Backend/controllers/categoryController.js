const Category = require('../models/Category');
const Item = require('../models/Item');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = (await Category.find().sort({ createdAt: -1 })).map(category => {
      const data = category.toObject();
      data.nameEn = data.nameEn || data.name || '';
      data.descriptionEn = data.descriptionEn || data.description || '';
      data.name = data.nameEn;
      data.description = data.descriptionEn;
      return data;
    });
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single category by id
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Manager)
const createCategory = async (req, res) => {
  try {
    const { nameEn, nameAr, descriptionEn, descriptionAr } = req.body;

    if (!nameEn?.trim() || !nameAr?.trim() || !descriptionEn?.trim() || !descriptionAr?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Arabic and English category names and descriptions are required'
      });
    }

    const existing = await Category.findOne({
      $or: [{ nameEn: nameEn.trim() }, { name: nameEn.trim() }]
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }

    const category = await Category.create({
      name: nameEn.trim(),
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      description: (descriptionEn || '').trim(),
      descriptionEn: (descriptionEn || '').trim(),
      descriptionAr: (descriptionAr || '').trim()
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Manager)
const updateCategory = async (req, res) => {
  try {
    const { name, nameEn, nameAr, description, descriptionEn, descriptionAr } = req.body;

    const updatedNameEn = nameEn ?? name;
    const updatedDescriptionEn = descriptionEn ?? description;
    if (![updatedNameEn, nameAr, updatedDescriptionEn, descriptionAr]
      .every(value => typeof value === 'string' && value.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Arabic and English category names and descriptions are required'
      });
    }

    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (updatedNameEn && updatedNameEn.trim() !== (category.nameEn || category.name)) {
      const duplicate = await Category.findOne({
        $or: [{ nameEn: updatedNameEn.trim() }, { name: updatedNameEn.trim() }]
      });
      if (duplicate && duplicate._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Another category with this name already exists'
        });
      }
      category.nameEn = updatedNameEn.trim();
      category.name = category.nameEn;
    }

    if (nameAr !== undefined) category.nameAr = nameAr.trim();
    if (updatedDescriptionEn !== undefined) {
      category.descriptionEn = updatedDescriptionEn.trim();
      category.description = category.descriptionEn;
    }
    if (descriptionAr !== undefined) category.descriptionAr = descriptionAr.trim();

    await category.save();

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Manager)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const itemsCount = await Item.countDocuments({ category: req.params.id });
    if (itemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${itemsCount} items are associated with it`
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

