const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample data
const sampleRecipes = [
  {
    title: "Classic Spaghetti Carbonara",
    description: "A traditional Italian pasta dish with eggs, cheese, pancetta, and pepper.",
    ingredients: [
      { name: "Spaghetti", amount: "400", unit: "grams" },
      { name: "Pancetta", amount: "200", unit: "grams" },
      { name: "Eggs", amount: "4", unit: "large" },
      { name: "Parmesan cheese", amount: "100", unit: "grams" },
      { name: "Black pepper", amount: "1", unit: "teaspoon" }
    ],
    instructions: [
      { step: 1, description: "Cook spaghetti in salted boiling water until al dente." },
      { step: 2, description: "Fry pancetta in a large pan until crispy." },
      { step: 3, description: "Beat eggs with grated parmesan and black pepper." },
      { step: 4, description: "Drain pasta and add to pancetta pan." },
      { step: 5, description: "Remove from heat and quickly mix in egg mixture." }
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: "Medium",
    category: "Main Course",
    cuisine: "Italian",
    tags: ["pasta", "italian", "quick", "dinner"]
  },
  {
    title: "Chocolate Chip Cookies",
    description: "Soft and chewy chocolate chip cookies that are perfect for any occasion.",
    ingredients: [
      { name: "All-purpose flour", amount: "2.25", unit: "cups" },
      { name: "Butter", amount: "1", unit: "cup" },
      { name: "Brown sugar", amount: "0.75", unit: "cup" },
      { name: "White sugar", amount: "0.75", unit: "cup" },
      { name: "Eggs", amount: "2", unit: "large" },
      { name: "Vanilla extract", amount: "2", unit: "teaspoons" },
      { name: "Chocolate chips", amount: "2", unit: "cups" }
    ],
    instructions: [
      { step: 1, description: "Preheat oven to 375°F (190°C)." },
      { step: 2, description: "Cream together butter and sugars." },
      { step: 3, description: "Beat in eggs and vanilla." },
      { step: 4, description: "Gradually add flour mixture." },
      { step: 5, description: "Stir in chocolate chips." },
      { step: 6, description: "Drop spoonfuls on baking sheet and bake 9-11 minutes." }
    ],
    prepTime: 15,
    cookTime: 10,
    servings: 24,
    difficulty: "Easy",
    category: "Dessert",
    cuisine: "American",
    tags: ["cookies", "dessert", "baking", "sweet"]
  }
];

// Import into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Recipe.deleteMany();
    await Review.deleteMany();

    console.log('Data Destroyed...');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@recipe.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });

    // Create sample user
    const sampleUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      bio: 'I love cooking and sharing recipes!',
      location: 'New York, USA'
    });

    // Add author to sample recipes
    const recipesWithAuthor = sampleRecipes.map(recipe => ({
      ...recipe,
      author: sampleUser._id
    }));

    // Create sample recipes
    await Recipe.create(recipesWithAuthor);

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Recipe.deleteMany();
    await Review.deleteMany();
    
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import data or -d to delete data');
  process.exit();
}