const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a review title'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  text: {
    type: String,
    required: [true, 'Please add review text'],
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not be more than 5'],
    required: [true, 'Please add a rating between 1 and 5']
  },
  recipe: {
    type: mongoose.Schema.ObjectId,
    ref: 'Recipe',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  helpful: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  helpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per recipe
ReviewSchema.index({ recipe: 1, user: 1 }, { unique: true });

// Static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function(recipeId) {
  const obj = await this.aggregate([
    {
      $match: { recipe: recipeId }
    },
    {
      $group: {
        _id: '$recipe',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Recipe').findByIdAndUpdate(recipeId, {
      averageRating: Math.round(obj[0].averageRating * 10) / 10,
      reviewCount: obj[0].reviewCount
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.recipe);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.recipe);
});

// Update helpful count when helpful array changes
ReviewSchema.pre('save', function(next) {
  this.helpfulCount = this.helpful.length;
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);