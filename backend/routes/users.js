const express = require('express');
const {
  getUsers,
  getUser,
  getUserRecipes,
  toggleFollow,
  getFavorites,
  uploadAvatar
} = require('../controllers/users');

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser);

router.route('/:id/recipes')
  .get(getUserRecipes);

router.route('/:id/follow')
  .post(protect, toggleFollow);

router.route('/favorites')
  .get(protect, getFavorites);

router.route('/avatar')
  .put(protect, upload.single('avatar'), uploadAvatar);

module.exports = router;