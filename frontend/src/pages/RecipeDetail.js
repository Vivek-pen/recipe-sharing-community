import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  AccessTime,
  Restaurant,
  Favorite,
  FavoriteBorder,
  Share,
  Print,
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RecipeDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  const { data: recipe, isLoading, error } = useQuery(
    ['recipe', id],
    async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/recipes/${id}`);
        console.log('RecipeDetail - Recipe data:', res.data.data);  
        console.log('RecipeDetail - Recipe image:', res.data.data.image);
        return res.data.data;
      } catch (error) {
        console.error('Error fetching recipe:', error);
        throw error;
      }
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const handleLike = async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axios.post(`${process.env.REACT_APP_API_URL}/recipes/${id}/like`, {}, config);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title || 'Check out this recipe!',
        text: recipe?.description || 'Amazing recipe from RecipeShare',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Box className="main-content">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !recipe) {
    return (
      <Box className="main-content">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h5" color="error" textAlign="center">
            Recipe not found or failed to load.
          </Typography>
          <Box textAlign="center" mt={2}>
            <Button variant="outlined" component={Link} to="/recipes">
              Back to Recipes
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="main-content">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Recipe Header */}
          <Grid item xs={12}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                {recipe.title || 'Untitled Recipe'}
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                {recipe.description || 'No description available'}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar
                  src={recipe.author?.avatar && recipe.author.avatar !== 'default-avatar.jpg' ? `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/${recipe.author.avatar}` : undefined}
                  component={Link}
                  to={`/profile/${recipe.author?._id}`}
                  sx={{ textDecoration: 'none' }}
                >
                  {recipe.author?.name?.[0] || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" component={Link} to={`/profile/${recipe.author?._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                    {recipe.author?.name || 'Unknown Chef'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : 'Date unknown'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Rating value={recipe.averageRating || 0} precision={0.5} readOnly />
                <Typography variant="body2">
                  ({recipe.reviewCount || 0} reviews)
                </Typography>
                <Box display="flex" gap={1}>
                  {isAuthenticated && (
                    <IconButton onClick={handleLike} color={isLiked ? 'error' : 'default'}>
                      {isLiked ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  )}
                  <IconButton onClick={handleShare}>
                    <Share />
                  </IconButton>
                  <IconButton onClick={handlePrint} className="no-print">
                    <Print />
                  </IconButton>
                </Box>
              </Box>

              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label={recipe.category || 'General'} color="primary" />
                <Chip label={recipe.cuisine || 'International'} variant="outlined" />
                <Chip 
                  label={recipe.difficulty || 'Medium'} 
                  color={
                    recipe.difficulty === 'Easy' ? 'success' :
                    recipe.difficulty === 'Medium' ? 'warning' : 'error'
                  }
                />
                {recipe.tags?.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Recipe Image */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <img
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  display: 'block',
                  backgroundColor: '#f0f0f0',
                  border: '2px solid red',
                }}
                src={
                  (() => {
                    console.log('RecipeDetail - Recipe image:', recipe.image);
                    const baseUrl = process.env.REACT_APP_API_URL;
                    
                    if (!recipe.image || recipe.image === 'default-recipe.jpg') {
                      console.log('⚠️ No valid image in database');
                      return 'https://via.placeholder.com/600x400?text=No+Image';
                    }
                    
                    const imageUrl = baseUrl.replace(/\/api\/?$/, '') + '/uploads/' + recipe.image;
                    console.log('✅ RecipeDetail - Constructed Image URL:', imageUrl);
                    console.log('Image element will be created with src:', imageUrl);
                    return imageUrl;
                  })()
                }
                alt={recipe.title}
                onError={(e) => {
                  console.error('❌ RecipeDetail - Image failed to load');
                  console.error('Failed URL:', e.target.src);
                  console.error('Recipe image field:', recipe.image);
                }}
                onLoad={(e) => {
                  console.log('✅ RecipeDetail - Image loaded successfully:', e.target.src);
                  console.log('Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                  console.log('Image display style:', window.getComputedStyle(e.target).display);
                  console.log('Image visibility:', window.getComputedStyle(e.target).visibility);
                }}
              />
            </Box>
          </Grid>

          {/* Recipe Info */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recipe Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Prep Time
                      </Typography>
                      <Typography variant="h6">{recipe.prepTime || 0} mins</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cook Time
                      </Typography>
                      <Typography variant="h6">{recipe.cookTime || 0} mins</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Restaurant color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Servings
                      </Typography>
                      <Typography variant="h6">{recipe.servings || 1}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Time
                      </Typography>
                      <Typography variant="h6">{(recipe.prepTime || 0) + (recipe.cookTime || 0)} mins</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {recipe.nutrition && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Nutrition (per serving)
                  </Typography>
                  <Grid container spacing={1}>
                    {recipe.nutrition.calories && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Calories: {recipe.nutrition.calories}
                        </Typography>
                      </Grid>
                    )}
                    {recipe.nutrition.protein && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Protein: {recipe.nutrition.protein}g
                        </Typography>
                      </Grid>
                    )}
                    {recipe.nutrition.carbs && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Carbs: {recipe.nutrition.carbs}g
                        </Typography>
                      </Grid>
                    )}
                    {recipe.nutrition.fat && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Fat: {recipe.nutrition.fat}g
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Ingredients */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Ingredients
                </Typography>
                <List>
                  {recipe.ingredients?.length > 0 ? (
                    recipe.ingredients.map((ingredient, index) => (
                      <ListItem key={index} divider={index < recipe.ingredients.length - 1}>
                        <ListItemText
                          primary={`${ingredient.amount || ''} ${ingredient.unit || ''} ${ingredient.name || 'Unknown ingredient'}`}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No ingredients listed" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Instructions */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Instructions
                </Typography>
                <List>
                  {recipe.instructions?.length > 0 ? (
                    recipe.instructions.map((instruction, index) => (
                      <ListItem key={index} sx={{ alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            minWidth: 30,
                            height: 30,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            mt: 0.5,
                          }}
                        >
                          {instruction.step || index + 1}
                        </Box>
                        <ListItemText
                          primary={instruction.description || 'No instruction provided'}
                          sx={{ mt: 0.5 }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No instructions provided" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RecipeDetail;