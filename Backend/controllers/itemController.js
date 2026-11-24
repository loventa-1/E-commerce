const Item = require('../models/Item');
const Category = require('../models/Category');
const { processAndSaveImage } = require('../utils/fileUpload');

// Helper to format item for public vs manager
const formatItem = (itemDoc, isManager) => {
  const item = itemDoc.toObject ? itemDoc.toObject() : { ...itemDoc };
  item.nameEn = item.nameEn || item.name || '';
  item.descriptionEn = item.descriptionEn || item.description || '';
  item.name = item.nameEn;
  item.description = item.descriptionEn;
  if (!isManager) {
    delete item.quantity;
  }
  return item;
};

// @desc    Get all items (public can filter by category & search, quantity only for manager)
// @route   GET /api/items
// @access  Public / Manager
const getItems = async (req, res) => {
  try {
    const isManager = req.user && req.user.role === 'manager';
    const { category, search } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { nameEn: { $regex: search, $options: 'i' } },
        { nameAr: { $regex: search, $options: 'i' } },
        { descriptionEn: { $regex: search, $options: 'i' } },
        { descriptionAr: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(query)
      .populate('category', 'name nameEn nameAr description descriptionEn descriptionAr')
      .sort({ createdAt: -1 });

    const formattedItems = items.map((item) => formatItem(item, isManager));

    res.json({
      success: true,
      count: formattedItems.length,
      data: formattedItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public / Manager
const getItemById = async (req, res) => {
  try {
    const isManager = req.user && req.user.role === 'manager';
    const item = await Item.findById(req.params.id).populate('category', 'name nameEn nameAr description descriptionEn descriptionAr');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: formatItem(item, isManager)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private (Manager)
const createItem = async (req, res) => {
  try {
    const { nameEn, nameAr, descriptionEn, descriptionAr, price, quantity, category, imageUrl } = req.body;

    if (!nameEn?.trim() || !nameAr?.trim() || !descriptionEn?.trim() || !descriptionAr?.trim() || price === undefined || quantity === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Arabic and English names and descriptions, price, quantity, and category'
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    let finalImageUrl = imageUrl && imageUrl.trim() ? imageUrl.trim() : undefined;
    if (finalImageUrl) {
      finalImageUrl = processAndSaveImage(finalImageUrl, req);
    }

    const item = await Item.create({
      name: nameEn.trim(),
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      description: descriptionEn.trim(),
      descriptionEn: descriptionEn.trim(),
      descriptionAr: descriptionAr.trim(),
      price: Number(price),
      quantity: Number(quantity),
      category,
      imageUrl: finalImageUrl
    });

    const populated = await Item.findById(item._id).populate('category', 'name nameEn nameAr description descriptionEn descriptionAr');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Manager)
const updateItem = async (req, res) => {
  try {
    const { name, nameEn, nameAr, description, descriptionEn, descriptionAr, price, quantity, category, imageUrl } = req.body;

    const hasBilingualText = [name, nameEn, nameAr, description, descriptionEn, descriptionAr]
      .some(value => value !== undefined);
    if (hasBilingualText && ![
      nameEn ?? name,
      nameAr,
      descriptionEn ?? description,
      descriptionAr
    ].every(value => typeof value === 'string' && value.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Arabic and English item names and descriptions'
      });
    }

    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
      item.category = category;
    }

    if (nameEn !== undefined || name !== undefined) {
      item.nameEn = (nameEn ?? name).trim();
      item.name = item.nameEn;
    }
    if (nameAr !== undefined) item.nameAr = nameAr.trim();
    if (descriptionEn !== undefined || description !== undefined) {
      item.descriptionEn = (descriptionEn ?? description).trim();
      item.description = item.descriptionEn;
    }
    if (descriptionAr !== undefined) item.descriptionAr = descriptionAr.trim();
    if (price !== undefined) item.price = Number(price);
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (imageUrl !== undefined) {
      item.imageUrl = processAndSaveImage(imageUrl.trim(), req);
    }

    await item.save();

    const populated = await Item.findById(item._id).populate('category', 'name nameEn nameAr description descriptionEn descriptionAr');

    res.json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (Manager)
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};

