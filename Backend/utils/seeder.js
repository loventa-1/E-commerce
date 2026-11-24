const User = require('../models/User');
const Category = require('../models/Category');
const Item = require('../models/Item');

const seedInitialData = async () => {
  try {
    // 1. Seed Manager User (Single manager user required by prompt)
    const managerEmail = (process.env.MANAGER_EMAIL || 'manager@shop.com').toLowerCase().trim();
    const existingManager = await User.findOne({ email: managerEmail });

    if (!existingManager) {
      await User.create({
        name: 'Store Manager',
        email: managerEmail,
        password: process.env.MANAGER_PASSWORD || 'manager123',
        role: 'manager'
      });
      console.log(`[Seed] Initial manager created (${managerEmail} / ${process.env.MANAGER_PASSWORD || 'manager123'})`);
    }

    // 2. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    let categories = [];

    if (categoryCount === 0) {
      categories = await Category.insertMany([
        { name: 'Electronics', description: 'Gadgets, phones, audio, and modern consumer tech.' },
        { name: 'Fashion & Apparel', description: 'Trendy clothes, shoes, and everyday fashion accessories.' },
        { name: 'Home & Kitchen', description: 'Quality essentials, kitchenware, and home decor.' },
        { name: 'Books & Media', description: 'Bestselling novels, educational reads, and entertainment.' },
        { name: 'Sports & Outdoors', description: 'Active gear, fitness equipment, and adventure essentials.' }
      ]);
      console.log(`[Seed] Created ${categories.length} categories`);
    } else {
      categories = await Category.find();
    }

    // 3. Seed Items if empty
    const itemCount = await Item.countDocuments();
    if (itemCount === 0 && categories.length > 0) {
      const catMap = {};
      categories.forEach(c => { catMap[c.name] = c._id; });

      const sampleItems = [
        {
          name: 'Wireless Noise-Cancelling Headphones',
          description: 'Premium over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.',
          price: 199.99,
          quantity: 25,
          category: catMap['Electronics'] || categories[0]._id,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
        },
        {
          name: 'Smart Fitness Watch Series X',
          description: 'Water-resistant fitness tracker with heart rate monitor, AMOLED display, and GPS tracking.',
          price: 129.50,
          quantity: 40,
          category: catMap['Electronics'] || categories[0]._id,
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
        },
        {
          name: 'Mechanical Gaming Keyboard RGB',
          description: 'Tactile mechanical switches, customizable RGB backlighting, and durable aluminum top frame.',
          price: 89.99,
          quantity: 15,
          category: catMap['Electronics'] || categories[0]._id,
          imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'
        },
        {
          name: 'Classic Leather Travel Backpack',
          description: 'Handcrafted genuine leather backpack with dedicated 15-inch laptop sleeve and water-resistant lining.',
          price: 145.00,
          quantity: 18,
          category: catMap['Fashion & Apparel'] || categories[1]._id,
          imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'
        },
        {
          name: 'Casual Minimalist Cotton Hoodie',
          description: '100% organic cotton fleece hoodie, ultra-soft interior, relaxed modern fit.',
          price: 49.99,
          quantity: 60,
          category: catMap['Fashion & Apparel'] || categories[1]._id,
          imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'
        },
        {
          name: 'Stainless Steel Pour-Over Coffee Maker',
          description: 'Barista-grade thermal carafe with reusable micro-mesh filter for brewing rich coffee.',
          price: 39.95,
          quantity: 30,
          category: catMap['Home & Kitchen'] || categories[2]._id,
          imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
        },
        {
          name: 'Ceramic Table Lamp with Dimmer',
          description: 'Artisan handcrafted ceramic base with warm ambient LED light and touch dimming control.',
          price: 64.00,
          quantity: 12,
          category: catMap['Home & Kitchen'] || categories[2]._id,
          imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'
        },
        {
          name: 'The Art of Clean Architecture (Hardcover)',
          description: 'A comprehensive modern guide to software design patterns, decoupling, and maintainability.',
          price: 34.50,
          quantity: 50,
          category: catMap['Books & Media'] || categories[3]._id,
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
        },
        {
          name: 'Insulated Sports Water Bottle 1L',
          description: 'Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12 hours.',
          price: 24.99,
          quantity: 75,
          category: catMap['Sports & Outdoors'] || categories[4]._id,
          imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'
        }
      ];

      await Item.insertMany(sampleItems);
      console.log(`[Seed] Created ${sampleItems.length} initial items`);
    }
  } catch (error) {
    console.error(`[Seed] Error seeding data:`, error.message);
  }
};

module.exports = seedInitialData;

