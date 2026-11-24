const Item = require('../models/Item');
const Category = require('../models/Category');

const renderHomePage = async (req, res) => {
  try {
    const [itemsCount, categoriesCount] = await Promise.all([
      Item.countDocuments(),
      Category.countDocuments()
    ]);

    res.render('index', {
      title: 'Shop MEAN Stack MVC Backend',
      itemsCount,
      categoriesCount,
      frontendUrl: 'http://localhost:4200'
    });
  } catch (error) {
    res.render('index', {
      title: 'Shop MEAN Stack MVC Backend',
      itemsCount: 0,
      categoriesCount: 0,
      frontendUrl: 'http://localhost:4200'
    });
  }
};

module.exports = { renderHomePage };