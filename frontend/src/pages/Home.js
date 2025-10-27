import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Rating,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';

const Home = () => {
  const { data: featuredRecipes, isLoading } = useQuery(
    'featuredRecipes', 
    async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/recipes/featured`);
        return res.data.data || [];
      } catch (error) {
        console.error('Error fetching featured recipes:', error);
        return [];
      }
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const { data: recentRecipes } = useQuery(
    'recentRecipes', 
    async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/recipes?limit=6`);
        return res.data.data || [];
      } catch (error) {
        console.error('Error fetching recent recipes:', error);
        return [];
      }
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const renderRecipeGrid = (recipes, title) => {
    if (!recipes || recipes.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No {title.toLowerCase()} available at the moment.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Check back later for delicious recipes!
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {recipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe._id}>
            <Card className="recipe-card" sx={{ height: '100%' }}>
              <CardActionArea component={Link} to={`/recipes/${recipe._id}`}>
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    recipe.image && recipe.image !== 'default-recipe.jpg'
                      ? `${process.env.REACT_APP_API_URL}/../uploads/${recipe.image}`
                      : 'https://via.placeholder.com/400x200?text=Recipe+Image'
                  }
                  alt={recipe.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200?text=Recipe+Image';
                  }}
                />
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom noWrap>
                    {recipe.title || 'Untitled Recipe'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, height: 40, overflow: 'hidden' }}
                  >
                    {recipe.description || 'No description available'}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Chip label={recipe.category || 'General'} size="small" color="primary" />
                    <Box display="flex" alignItems="center">
                      <Rating value={recipe.averageRating || 0} precision={0.5} size="small" readOnly />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        ({recipe.reviewCount || 0})
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    By {recipe.author?.name || 'Unknown'} • {(recipe.prepTime || 0) + (recipe.cookTime || 0)} mins
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box className="main-content">
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Share Your Culinary Creations
          </Typography>
          <Typography variant="h5" component="p" gutterBottom sx={{ mb: 4 }}>
            Discover amazing recipes from home cooks around the world and share your own
            delicious creations with our community.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/recipes"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              Browse Recipes
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/register"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Join Community
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Featured Recipes */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
            Featured Recipes
          </Typography>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            renderRecipeGrid(featuredRecipes, 'Featured Recipes')
          )}
        </Box>

        {/* Recent Recipes */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
            Recent Recipes
          </Typography>
          {renderRecipeGrid(recentRecipes, 'Recent Recipes')}
          <Box textAlign="center" mt={4}>
            <Button variant="outlined" component={Link} to="/recipes" size="large">
              View All Recipes
            </Button>
          </Box>
        </Box>

        {/* Stats Section */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 6,
            px: 4,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Join Our Growing Community
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Share recipes, discover new flavors, and connect with fellow food lovers
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" component="div" fontWeight="bold">
                1000+
              </Typography>
              <Typography variant="h6">Recipes</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" component="div" fontWeight="bold">
                500+
              </Typography>
              <Typography variant="h6">Home Cooks</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" component="div" fontWeight="bold">
                5000+
              </Typography>
              <Typography variant="h6">Reviews</Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;