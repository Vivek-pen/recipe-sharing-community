const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
exports.getRecipes = async (req, res, next) => {
  try {
    let query = { isPublished: true };
    
    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by cuisine
    if (req.query.cuisine) {
      query.cuisine = req.query.cuisine;
    }

    // Filter by difficulty
    if (req.query.difficulty) {
      query.difficulty = req.query.difficulty;
    }

    // Filter by prep time
    if (req.query.maxPrepTime) {
      query.prepTime = { $lte: parseInt(req.query.maxPrepTime) };
    }

    // Filter by rating
    if (req.query.minRating) {
      query.averageRating = { $gte: parseFloat(req.query.minRating) };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    // Sort
    let sortOptions = {};
    switch (req.query.sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'rating':
        sortOptions = { averageRating: -1 };
        break;
      case 'popular':
        sortOptions = { likesCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'name avatar')
      .sort(sortOptions)
      .skip(startIndex)
      .limit(limit);

    const total = await Recipe.countDocuments(query);

    res.status(200).json({
      success: true,
      count: recipes.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: recipes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private
exports.createRecipe = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.author = req.user.id;

    const recipe = await Recipe.create(req.body);

    // Update user's recipe count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { recipeCount: 1 }
    });

    res.status(201).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private
exports.updateRecipe = async (req, res, next) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Make sure user is recipe owner or admin
    if (recipe.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this recipe'
      });
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private
exports.deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Make sure user is recipe owner or admin
    if (recipe.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
    }

    await recipe.remove();

    // Update user's recipe count
    await User.findByIdAndUpdate(recipe.author, {
      $inc: { recipeCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/Unlike recipe
// @route   POST /api/recipes/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const isLiked = recipe.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike
      recipe.likes = recipe.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // Like
      recipe.likes.push(req.user.id);
    }

    await recipe.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Recipe unliked' : 'Recipe liked',
      data: {
        isLiked: !isLiked,
        likesCount: recipe.likes.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add recipe to favorites
// @route   POST /api/recipes/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const isFavorited = user.favorites.includes(req.params.id);

    if (isFavorited) {
      // Remove from favorites
      user.favorites = user.favorites.filter(id => id.toString() !== req.params.id);
    } else {
      // Add to favorites
      user.favorites.push(req.params.id);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isFavorited ? 'Recipe removed from favorites' : 'Recipe added to favorites',
      data: {
        isFavorited: !isFavorited
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload recipe image
// @route   PUT /api/recipes/:id/image
// @access  Private
exports.uploadRecipeImage = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Make sure user is recipe owner or admin
    if (recipe.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this recipe'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { image: req.file.filename },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedRecipe
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add review to recipe
// @route   POST /api/recipes/:id/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    req.body.recipe = req.params.id;
    req.body.user = req.user.id;

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get reviews for recipe
// @route   GET /api/recipes/:id/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ recipe: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get featured recipes
// @route   GET /api/recipes/featured
// @access  Public
exports.getFeaturedRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ isFeatured: true, isPublished: true })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};