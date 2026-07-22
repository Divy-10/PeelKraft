import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

import connectDB from './config/db.js';
import Admin from './models/Admin.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Blog from './models/Blog.js';
import FAQ from './models/FAQ.js';
import Testimonial from './models/Testimonial.js';
import Settings from './models/Settings.js';
import SEO from './models/SEO.js';

export const seedDatabase = async (isCli = false) => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    await Promise.all([
      Admin.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Blog.deleteMany({}),
      FAQ.deleteMany({}),
      Testimonial.deleteMany({}),
      Settings.deleteMany({}),
      SEO.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create Super Admin
    const admin = await Admin.create({
      name: 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@peelkraft.com',
      password: process.env.ADMIN_PASSWORD || 'PeelKraft@2024',
      role: 'superadmin',
      status: 'active',
    });
    console.log(`👤 Created Super Admin: ${admin.email}`);

    // Create Categories
    const categories = await Category.insertMany([
      { name: 'Orange Peel Powder', slug: 'orange-peel-powder', description: 'Premium dehydrated orange peel powder for cooking and health supplements', status: 'active', order: 1 },
      { name: 'Orange Peel Snacks', slug: 'orange-peel-snacks', description: 'Delicious and nutritious snacks made from orange peels', status: 'active', order: 2 },
      { name: 'Orange Peel Extracts', slug: 'orange-peel-extracts', description: 'Concentrated extracts for beverages and supplements', status: 'active', order: 3 },
      { name: 'Orange Peel Seasoning', slug: 'orange-peel-seasoning', description: 'Flavourful seasonings and spice blends with orange peel', status: 'active', order: 4 },
    ]);
    console.log(`📂 Created ${categories.length} categories`);

    // Create Products
    const products = await Product.insertMany([
      {
        name: 'PeelKraft Premium Orange Peel Powder',
        slug: 'premium-orange-peel-powder',
        category: categories[0]._id,
        shortDescription: 'Pure, organic orange peel powder packed with vitamins and antioxidants.',
        description: '<h2>Premium Orange Peel Powder</h2><p>Our flagship product is crafted from carefully selected, premium-grade orange peels. Through our proprietary dehydration process, we preserve maximum nutrients while creating a versatile powder that can be used in smoothies, baking, cooking, and skincare routines.</p><p>Each batch is tested for quality and purity, ensuring you get the best nature has to offer.</p>',
        benefits: ['Rich in Vitamin C and antioxidants', 'Supports digestive health', 'Natural skin brightening properties', 'Boosts immunity', 'Anti-inflammatory properties'],
        ingredients: ['100% Organic Orange Peel'],
        nutrition: { calories: '97 kcal per 100g', protein: '1.5g', carbs: '25g', fat: '0.2g', fiber: '10.6g', vitaminC: '136mg' },
        storage: 'Store in a cool, dry place. Keep away from direct sunlight. Seal tightly after use.',
        shelfLife: '12 months from date of manufacture',
        weight: '200g',
        amazonLink: 'https://www.amazon.in',
        status: 'published',
        featured: true,
        seoTitle: 'Premium Orange Peel Powder | PeelKraft',
        seoDescription: 'Buy premium organic orange peel powder. Rich in Vitamin C, antioxidants & fiber. Perfect for smoothies, baking & skincare.',
        thumbnail: { url: '/images/logo.png' },
        featuredImage: { url: '/images/logo.png' },
        gallery: [
          { url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800', alt: 'Orange peel powder in bowl' },
          { url: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=800', alt: 'Fresh oranges' },
          { url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800', alt: 'Citrus close up' },
        ],
      },
      {
        name: 'PeelKraft Candied Orange Peel Bites',
        slug: 'candied-orange-peel-bites',
        category: categories[1]._id,
        shortDescription: 'Deliciously sweet and tangy candied orange peel bites. A guilt-free treat!',
        description: '<h2>Candied Orange Peel Bites</h2><p>Experience the perfect balance of sweet and citrus with our handcrafted candied orange peel bites. Made from premium orange peels that are slowly candied to perfection, these bites are a delightful snack that\'s also packed with natural goodness.</p>',
        benefits: ['Natural energy booster', 'Rich in dietary fiber', 'No artificial preservatives', 'Gluten-free snacking option'],
        ingredients: ['Orange Peel', 'Organic Cane Sugar', 'Natural Citrus Extract'],
        nutrition: { calories: '120 kcal per 50g', protein: '0.8g', carbs: '28g', fat: '0.1g', fiber: '4g' },
        storage: 'Store in an airtight container at room temperature.',
        shelfLife: '6 months from date of manufacture',
        weight: '150g',
        amazonLink: 'https://www.amazon.in',
        status: 'published',
        featured: true,
        seoTitle: 'Candied Orange Peel Bites | Healthy Snacks | PeelKraft',
        seoDescription: 'Try PeelKraft candied orange peel bites. A delicious, guilt-free snack packed with fiber and natural citrus goodness.',
        thumbnail: { url: '/images/logo.png' },
        featuredImage: { url: '/images/logo.png' },
        gallery: [
          { url: '/images/logo.png', alt: 'PeelKraft' },
        ],
      },
      {
        name: 'PeelKraft Orange Peel Tea Blend',
        slug: 'orange-peel-tea-blend',
        category: categories[2]._id,
        shortDescription: 'A soothing herbal tea blend featuring dried orange peel and complementary herbs.',
        description: '<h2>Orange Peel Tea Blend</h2><p>Unwind with our specially crafted orange peel tea blend. We combine sun-dried orange peels with chamomile, ginger, and a hint of cinnamon to create a warm, comforting beverage that supports digestion and relaxation.</p>',
        benefits: ['Aids digestion', 'Calming and relaxing', 'Rich in antioxidants', 'Caffeine-free'],
        ingredients: ['Dried Orange Peel', 'Chamomile', 'Ginger Root', 'Cinnamon Bark'],
        nutrition: { calories: '5 kcal per cup', protein: '0g', carbs: '1g', fat: '0g', fiber: '0.5g' },
        storage: 'Store in a cool, dry place away from strong odours.',
        shelfLife: '18 months from date of manufacture',
        weight: '100g (50 tea bags)',
        amazonLink: 'https://www.amazon.in',
        status: 'published',
        featured: true,
        seoTitle: 'Orange Peel Tea Blend | Herbal Tea | PeelKraft',
        seoDescription: 'Discover PeelKraft orange peel herbal tea. A caffeine-free blend with chamomile & ginger for relaxation and digestion.',
        thumbnail: { url: '/images/logo.png' },
        featuredImage: { url: '/images/logo.png' },
        gallery: [
          { url: '/images/logo.png', alt: 'PeelKraft' },
        ],
      },
      {
        name: 'PeelKraft Citrus Zest Seasoning',
        slug: 'citrus-zest-seasoning',
        category: categories[3]._id,
        shortDescription: 'Elevate your dishes with our premium citrus zest seasoning blend.',
        description: '<h2>Citrus Zest Seasoning</h2><p>Transform any dish with our signature citrus zest seasoning. This premium blend combines finely ground orange peel with select herbs and spices to create a versatile seasoning that pairs beautifully with salads, grilled meats, seafood, and pasta.</p>',
        benefits: ['Versatile flavour enhancer', 'No MSG or artificial flavours', 'Rich in natural oils', 'Perfect for healthy cooking'],
        ingredients: ['Orange Peel', 'Black Pepper', 'Dried Thyme', 'Garlic Powder', 'Sea Salt', 'Dried Rosemary'],
        nutrition: { calories: '15 kcal per tsp', protein: '0.3g', carbs: '3g', fat: '0.2g', fiber: '1g' },
        storage: 'Store in a cool, dry place.',
        shelfLife: '12 months from date of manufacture',
        weight: '80g',
        amazonLink: 'https://www.amazon.in',
        status: 'published',
        featured: true,
        seoTitle: 'Citrus Zest Seasoning | Gourmet Spice | PeelKraft',
        seoDescription: 'PeelKraft citrus zest seasoning. A gourmet spice blend with orange peel, herbs & spices. Perfect for healthy, flavorful cooking.',
        thumbnail: { url: '/images/logo.png' },
        featuredImage: { url: '/images/logo.png' },
        gallery: [
          { url: '/images/logo.png', alt: 'PeelKraft' },
        ],
      },
    ]);
    console.log(`📦 Created ${products.length} products`);

    // Create Blogs
    const blogs = await Blog.insertMany([
      {
        title: 'The Incredible Health Benefits of Orange Peels',
        slug: 'health-benefits-of-orange-peels',
        content: '<p>Orange peels are often discarded without a second thought, but they are actually one of the most nutrient-dense parts of the fruit. Rich in flavonoids, Vitamin C, and dietary fiber, orange peels offer a wide range of health benefits that most people are unaware of.</p><h2>1. Packed with Nutrients</h2><p>Orange peels contain higher concentrations of certain nutrients than the fruit itself. They are particularly rich in Vitamin C, Vitamin A, and various B vitamins.</p><h2>2. Supports Digestive Health</h2><p>The high fiber content in orange peels can help promote healthy digestion, prevent constipation, and support gut health.</p><h2>3. Heart Health</h2><p>The flavonoids found in orange peels, particularly hesperidin, have been shown to lower cholesterol and blood pressure levels.</p><h2>4. Anti-Cancer Properties</h2><p>Studies have shown that the compounds found in orange peels may help inhibit the growth of cancer cells.</p>',
        excerpt: 'Discover why orange peels are a nutritional powerhouse that you should never throw away.',
        category: 'Health & Wellness',
        author: admin._id,
        tags: ['health', 'nutrition', 'orange peel', 'vitamin C', 'wellness'],
        status: 'published',
        featured: true,
        seoTitle: 'Health Benefits of Orange Peels | PeelKraft Blog',
        seoDescription: 'Learn about the incredible health benefits of orange peels. From Vitamin C to digestive health, discover why you should eat orange peels.',
        featuredImage: { url: '/images/logo.png' },
      },
      {
        title: 'How PeelKraft is Revolutionizing Sustainable Food Production',
        slug: 'peelkraft-sustainable-food-production',
        content: '<p>At PeelKraft, sustainability isn\'t just a buzzword — it\'s the foundation of everything we do. By transforming orange peels, a by-product that would otherwise end up in landfills, into premium food products, we\'re creating a circular economy that benefits both people and the planet.</p><h2>The Problem</h2><p>India produces over 10 million tonnes of oranges annually, generating approximately 4 million tonnes of orange peel waste. This waste, when not properly managed, contributes to environmental pollution.</p><h2>Our Solution</h2><p>PeelKraft\'s innovative approach transforms this waste into valuable, nutritious food products through our state-of-the-art manufacturing process.</p>',
        excerpt: 'Learn how PeelKraft is transforming orange peel waste into premium food products, reducing environmental impact.',
        category: 'Sustainability',
        author: admin._id,
        tags: ['sustainability', 'food waste', 'circular economy', 'environment', 'innovation'],
        status: 'published',
        featured: true,
        seoTitle: 'PeelKraft Sustainable Food Production | Innovation in Food',
        seoDescription: 'Discover how PeelKraft transforms orange peel waste into premium food products using sustainable practices.',
        featuredImage: { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800' },
      },
      {
        title: '5 Delicious Recipes Using Orange Peel Powder',
        slug: '5-recipes-orange-peel-powder',
        content: '<p>Orange peel powder is one of the most versatile ingredients in your kitchen. Here are five delicious recipes that showcase the amazing flavour and health benefits of this superfood.</p><h2>1. Orange Peel Smoothie</h2><p>Blend 1 tsp orange peel powder with banana, yoghurt, and honey for a refreshing, vitamin-packed smoothie.</p><h2>2. Citrus Salad Dressing</h2><p>Mix orange peel powder with olive oil, lemon juice, and Dijon mustard for a zesty salad dressing.</p><h2>3. Orange Peel Muffins</h2><p>Add 2 tbsp of orange peel powder to your favourite muffin recipe for a citrusy twist.</p>',
        excerpt: 'From smoothies to baked goods, discover creative ways to use orange peel powder in your daily cooking.',
        category: 'Recipes',
        author: admin._id,
        tags: ['recipes', 'cooking', 'orange peel powder', 'healthy eating', 'food'],
        status: 'published',
        featured: false,
        seoTitle: '5 Orange Peel Powder Recipes | PeelKraft Blog',
        seoDescription: 'Discover 5 delicious and healthy recipes using PeelKraft orange peel powder. Easy-to-make smoothies, salads, and more.',
        featuredImage: { url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800' },
      },
    ]);
    console.log(`📝 Created ${blogs.length} blogs`);

    // Create FAQs
    const faqs = await FAQ.insertMany([
      { question: 'What is PeelKraft?', answer: 'PeelKraft is a premium sustainable food brand by JuiceTap Global Pvt Ltd that converts orange peels into nutritious food products. We believe in zero-waste food production and creating value from what is typically discarded.', category: 'General', order: 1, status: 'active' },
      { question: 'Are PeelKraft products organic?', answer: 'Yes, we source our orange peels from certified organic farms and our manufacturing process follows strict organic standards. Our products are free from artificial preservatives, colours, and flavours.', category: 'Products', order: 2, status: 'active' },
      { question: 'Where can I buy PeelKraft products?', answer: 'PeelKraft products are available exclusively on Amazon India. Click the "Buy on Amazon" button on any product page to be redirected to the Amazon listing.', category: 'Purchase', order: 3, status: 'active' },
      { question: 'How are orange peels processed?', answer: 'Our orange peels go through a multi-step process: collection from juice manufacturers, thorough washing, dehydration at controlled temperatures, grinding, quality testing, and packaging — all done in our FSSAI-certified facility.', category: 'Manufacturing', order: 4, status: 'active' },
      { question: 'Are PeelKraft products safe for children?', answer: 'Yes, our products are made from natural ingredients and are safe for children above the age of 3. However, we recommend consulting with a paediatrician if your child has any citrus allergies.', category: 'Health', order: 5, status: 'active' },
      { question: 'What is the shelf life of PeelKraft products?', answer: 'Our products have varying shelf lives depending on the type. Orange peel powder lasts 12 months, candied peels 6 months, and tea blends 18 months from the date of manufacture. Always check the packaging for specific dates.', category: 'Products', order: 6, status: 'active' },
      { question: 'Do you offer international shipping?', answer: 'Currently, PeelKraft products are available for shipping within India through Amazon.in. We are working on expanding to international markets. Subscribe to our newsletter to stay updated!', category: 'Shipping', order: 7, status: 'active' },
      { question: 'How does PeelKraft contribute to sustainability?', answer: 'PeelKraft diverts thousands of tonnes of orange peel waste from landfills annually. By converting this waste into valuable food products, we reduce methane emissions, create jobs, and promote a circular economy.', category: 'Sustainability', order: 8, status: 'active' },
    ]);
    console.log(`❓ Created ${faqs.length} FAQs`);

    // Create Testimonials
    const testimonials = await Testimonial.insertMany([
      { name: 'Priya Sharma', designation: 'Health Enthusiast', company: '', content: 'PeelKraft\'s orange peel powder has become a staple in my kitchen. I add it to my morning smoothies and the taste is absolutely wonderful. Love that it\'s sustainable too!', rating: 5, featured: true, status: 'active', order: 1 },
      { name: 'Rajesh Kumar', designation: 'Chef', company: 'The Organic Kitchen', content: 'As a chef, I\'m always looking for unique, high-quality ingredients. PeelKraft\'s citrus zest seasoning adds an incredible depth of flavour to my dishes. Highly recommended!', rating: 5, featured: true, status: 'active', order: 2 },
      { name: 'Ananya Patel', designation: 'Nutritionist', company: 'NutriLife Clinic', content: 'I recommend PeelKraft products to my clients who are looking for natural ways to boost their Vitamin C intake. The quality is consistently excellent.', rating: 5, featured: true, status: 'active', order: 3 },
      { name: 'Vikram Singh', designation: 'Fitness Trainer', company: '', content: 'The candied orange peel bites are my go-to post-workout snack. Natural energy, great taste, and knowing I\'m supporting a sustainable brand makes it even better.', rating: 4, featured: true, status: 'active', order: 4 },
    ]);
    console.log(`💬 Created ${testimonials.length} testimonials`);

    // Create Settings
    await Settings.create({
      companyName: 'PeelKraft',
      tagline: 'Premium Sustainable Food from Orange Peels',
      email: 'info@peelkraft.com',
      phone: '+91 85115 33004',
      address: '5Q82+VM Surat, Gujarat, India',
      whatsapp: '+918511533004',
      socialLinks: {
        instagram: 'https://instagram.com/peelkraft',
      },
      footerText: '© 2024 PeelKraft by JuiceTap Global Pvt Ltd. All rights reserved.',
      amazonStoreUrl: 'https://www.amazon.in/stores/PeelKraft',
    });
    console.log('⚙️  Created site settings');

    // Create SEO entries
    await SEO.insertMany([
      { page: 'home', metaTitle: 'PeelKraft — Premium Sustainable Food from Orange Peels', metaDescription: 'PeelKraft by JuiceTap Global converts premium orange peels into nutritious food products. Discover our range of organic, sustainable orange peel foods.', keywords: ['orange peel food', 'sustainable food', 'PeelKraft', 'organic orange peel', 'health food'] },
      { page: 'about', metaTitle: 'About PeelKraft — Our Story & Mission', metaDescription: 'Learn about PeelKraft\'s mission to transform orange peel waste into premium food products. Discover our story, values, and sustainability commitment.', keywords: ['about PeelKraft', 'sustainable food brand', 'JuiceTap Global'] },
      { page: 'products', metaTitle: 'Our Products — Premium Orange Peel Foods | PeelKraft', metaDescription: 'Explore PeelKraft\'s range of premium orange peel food products. From powder to snacks to tea — all sustainably made.', keywords: ['orange peel products', 'buy orange peel powder', 'organic food'] },
      { page: 'sustainability', metaTitle: 'Sustainability — Our Commitment | PeelKraft', metaDescription: 'Discover how PeelKraft is creating a circular economy by transforming orange peel waste into premium food products.', keywords: ['sustainability', 'circular economy', 'zero waste food'] },
      { page: 'contact', metaTitle: 'Contact Us — Get in Touch | PeelKraft', metaDescription: 'Have questions about PeelKraft products? Contact us via email, phone, or our contact form. We\'d love to hear from you!', keywords: ['contact PeelKraft', 'customer support'] },
    ]);
    console.log('🔍 Created SEO entries');

    console.log('\n✅ Database seeded successfully!');
    console.log(`\n📧 Admin Login: ${process.env.ADMIN_EMAIL || 'admin@peelkraft.com'}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'PeelKraft@2024'}\n`);

    if (isCli) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seed error:', error);
    if (isCli) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

const __filename = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve(__filename));

if (isDirectRun) {
  const startCliSeed = async () => {
    try {
      await connectDB();
      await seedDatabase(true);
    } catch (err) {
      console.error('CLI Seed execution failed:', err);
      process.exit(1);
    }
  };
  startCliSeed();
}
