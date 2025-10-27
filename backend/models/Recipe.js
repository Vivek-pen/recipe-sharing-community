const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a recipe title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  }],
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  prepTime: {
    type: Number,
    required: [true, 'Please add preparation time in minutes']
  },
  cookTime: {
    type: Number,
    required: [true, 'Please add cooking time in minutes']
  },
  servings: {
    type: Number,
    required: [true, 'Please add number of servings'],
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Appetizer',
      'Main Course',
      'Dessert',
      'Breakfast',
      'Lunch',
      'Dinner',
      'Snack',
      'Beverage',
      'Soup',
      'Salad',
      'Vegetarian',
      'Vegan',
      'Gluten-Free'
    ]
  },
  cuisine: {
    type: String,
    required: [true, 'Please add a cuisine type'],
    enum: [
      'Italian',
      'Chinese',
      'Mexican',
      'Indian',
      'French',
      'Japanese',
      'Thai',
      'Greek',
      'American',
      'Mediterranean',
      'Korean',
      'Spanish',
      'Other'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,
    default: 'default-recipe.jpg'
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not be more than 5']
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for text search
RecipeSchema.index({
  title: 'text',
  description: 'text',
  'ingredients.name': 'text',
  tags: 'text'
});

// Virtual for total time
RecipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Virtual populate for reviews
RecipeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'recipe',
  justOne: false
});

// Cascade delete reviews when a recipe is deleted
RecipeSchema.pre('remove', async function(next) {
  await this.model('Review').deleteMany({ recipe: this._id });
  next();
});

// Update likes count when likes array changes
RecipeSchema.pre('save', function(next) {
  this.likesCount = this.likes.length;
  next();
});

module.exports = mongoose.model('Recipe', RecipeSchema);