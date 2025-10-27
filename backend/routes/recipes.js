const express = require('express');
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleLike,
  toggleFavorite,
  uploadRecipeImage,
  addReview,
  getReviews,
  getFeaturedRecipes
} = require('../controllers/recipes');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/featured')
  .get(getFeaturedRecipes);

router.route('/')
  .get(getRecipes)
  .post(protect, createRecipe);

router.route('/:id')
  .get(getRecipe)
  .put(protect, updateRecipe)
  .delete(protect, deleteRecipe);

router.route('/:id/like')
  .post(protect, toggleLike);

router.route('/:id/favorite')
  .post(protect, toggleFavorite);

router.route('/:id/image')
  .put(protect, upload.single('image'), uploadRecipeImage);

router.route('/:id/reviews')
  .get(getReviews)
  .post(protect, addReview);

module.exports = router;