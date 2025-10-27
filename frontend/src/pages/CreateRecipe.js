import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add, Delete, CloudUpload } from '@mui/icons-material';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CreateRecipe = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ingredients: [{ name: '', amount: '', unit: 'cup' }],
      instructions: [{ step: 1, description: '' }],
      tags: '',
      difficulty: 'Easy',
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: 'instructions',
  });

  const categories = [
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
    'Gluten-Free',
  ];

  const cuisines = [
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
    'Other',
  ];

  const units = [
    'cup',
    'tbsp',
    'tsp',
    'lb',
    'oz',
    'g',
    'kg',
    'ml',
    'l',
    'piece',
    'slice',
    'clove',
    'pinch',
    'to taste',
  ];

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Process tags
      let tags = [];
      if (data.tags && typeof data.tags === 'string') {
        tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      } else if (Array.isArray(data.tags)) {
        tags = data.tags.filter(tag => tag.trim() !== '');
      }

      // Create recipe data
      const recipeData = {
        ...data,
        tags: tags,
        // Ensure numeric values
        prepTime: parseInt(data.prepTime),
        cookTime: parseInt(data.cookTime),
        servings: parseInt(data.servings),
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/recipes`,
        recipeData,
        config
      );

      const recipeId = response.data.data._id;

      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        await axios.put(
          `${process.env.REACT_APP_API_URL}/recipes/${recipeId}/image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setSuccess('Recipe created successfully!');
      setTimeout(() => {
        navigate(`/recipes/${recipeId}`);
      }, 2000);
    } catch (err) {
      console.error('Recipe creation error:', err);
      setError(err.response?.data?.message || 'Failed to create recipe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="main-content">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Create New Recipe
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Basic Information
            </Typography>

            <TextField
              fullWidth
              label="Recipe Title"
              margin="normal"
              error={!!errors.title}
              helperText={errors.title?.message}
              {...register('title', {
                required: 'Recipe title is required',
                maxLength: {
                  value: 100,
                  message: 'Title must be less than 100 characters',
                },
              })}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              margin="normal"
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register('description', {
                required: 'Description is required',
                maxLength: {
                  value: 500,
                  message: 'Description must be less than 500 characters',
                },
              })}
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    {...register('category', { required: 'Category is required' })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                      {errors.category.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.cuisine}>
                  <InputLabel>Cuisine</InputLabel>
                  <Select
                    label="Cuisine"
                    {...register('cuisine', { required: 'Cuisine is required' })}
                  >
                    {cuisines.map((cuisine) => (
                      <MenuItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.cuisine && (
                    <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                      {errors.cuisine.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Prep Time (mins)"
                  type="number"
                  error={!!errors.prepTime}
                  helperText={errors.prepTime?.message}
                  {...register('prepTime', {
                    required: 'Prep time is required',
                    min: { value: 1, message: 'Must be at least 1 minute' },
                  })}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Cook Time (mins)"
                  type="number"
                  error={!!errors.cookTime}
                  helperText={errors.cookTime?.message}
                  {...register('cookTime', {
                    required: 'Cook time is required',
                    min: { value: 1, message: 'Must be at least 1 minute' },
                  })}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Servings"
                  type="number"
                  error={!!errors.servings}
                  helperText={errors.servings?.message}
                  {...register('servings', {
                    required: 'Servings is required',
                    min: { value: 1, message: 'Must serve at least 1 person' },
                  })}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    label="Difficulty"
                    defaultValue="Easy"
                    {...register('difficulty')}
                  >
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Image Upload */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Recipe Image
            </Typography>

            <Box sx={{ mt: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 2 }}
                >
                  Upload Recipe Image
                </Button>
              </label>

              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 300,
                      borderRadius: 8,
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Ingredients */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Ingredients
            </Typography>

            {ingredientFields.map((field, index) => (
              <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Ingredient"
                    size="small"
                    {...register(`ingredients.${index}.name`, {
                      required: 'Ingredient name is required',
                    })}
                    error={!!errors.ingredients?.[index]?.name}
                    helperText={errors.ingredients?.[index]?.name?.message}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Amount"
                    size="small"
                    {...register(`ingredients.${index}.amount`, {
                      required: 'Amount is required',
                    })}
                    error={!!errors.ingredients?.[index]?.amount}
                    helperText={errors.ingredients?.[index]?.amount?.message}
                  />
                </Grid>
                <Grid item xs={4} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Unit</InputLabel>
                    <Select
                      label="Unit"
                      {...register(`ingredients.${index}.unit`, {
                        required: 'Unit is required',
                      })}
                      error={!!errors.ingredients?.[index]?.unit}
                    >
                      {units.map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {unit}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2} sm={2}>
                  <IconButton
                    onClick={() => removeIngredient(index)}
                    disabled={ingredientFields.length === 1}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => appendIngredient({ name: '', amount: '', unit: 'cup' })}
              sx={{ mb: 3 }}
            >
              Add Ingredient
            </Button>

            {/* Instructions */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Instructions
            </Typography>

            {instructionFields.map((field, index) => (
              <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    label={`Step ${index + 1}`}
                    multiline
                    rows={2}
                    {...register(`instructions.${index}.description`, {
                      required: 'Instruction is required',
                    })}
                    error={!!errors.instructions?.[index]?.description}
                    helperText={errors.instructions?.[index]?.description?.message}
                  />
                  <input
                    type="hidden"
                    {...register(`instructions.${index}.step`)}
                    value={index + 1}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => removeInstruction(index)}
                    disabled={instructionFields.length === 1}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() =>
                appendInstruction({
                  step: instructionFields.length + 1,
                  description: '',
                })
              }
              sx={{ mb: 3 }}
            >
              Add Instruction
            </Button>

            {/* Tags */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Tags (comma-separated)
            </Typography>

            <TextField
              fullWidth
              label="Tags (e.g., quick, healthy, vegetarian)"
              margin="normal"
              helperText="Separate tags with commas"
              {...register('tags')}
            />

            {/* Submit Button */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ minWidth: 200 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Create Recipe'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateRecipe;