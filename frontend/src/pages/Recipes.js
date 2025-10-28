import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Pagination,
  CircularProgress,
  InputAdornment,
  Paper,
} from '@mui/material';
import { Search, AccessTime, Restaurant } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';

const Recipes = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    cuisine: '',
    difficulty: '',
    sort: 'newest',
  });
  const [page, setPage] = useState(1);

  // Parse URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setFilters(prev => ({ ...prev, search: searchParam }));
    }
  }, [location.search]);

  const fetchRecipes = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters,
      });

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/recipes?${params}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  };

  const { data, isLoading, error } = useQuery(
    ['recipes', page, filters],
    fetchRecipes,
    {
      keepPreviousData: true,
      retry: 1,
    }
  );

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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  if (error) {
    return (
      <Box className="main-content">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography color="error" textAlign="center">
            Error loading recipes. Please try again later.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="main-content">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          Discover Amazing Recipes
        </Typography>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box component="form" onSubmit={handleSearchSubmit}>
                <TextField
                  fullWidth
                  placeholder="Search recipes..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Cuisine</InputLabel>
                <Select
                  value={filters.cuisine}
                  label="Cuisine"
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                >
                  <MenuItem value="">All Cuisines</MenuItem>
                  {cuisines.map((cuisine) => (
                    <MenuItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={filters.difficulty}
                  label="Difficulty"
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                  <MenuItem value="">Any Difficulty</MenuItem>
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sort}
                  label="Sort By"
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="popular">Most Popular</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Results */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : data?.data?.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No recipes found matching your criteria.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or search terms.
            </Typography>
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Found {data?.total || 0} recipes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Page {page} of {data?.pagination?.pages || 1}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {data?.data?.map((recipe) => (
                <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                  <Card className="recipe-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea
                      component={Link}
                      to={`/recipes/${recipe._id}`}
                      sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={
                          (() => {
                            const baseUrl = process.env.REACT_APP_API_URL;
                            if (!recipe.image || recipe.image === 'default-recipe.jpg') {
                              return 'https://placehold.co/400x200?text=Recipe+Image';
                            }
                            // Remove /api from end to get base URL
                            return baseUrl.replace(/\/api\/?$/, '') + '/uploads/' + recipe.image;
                          })()
                        }
                        alt={recipe.title}
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x200?text=Recipe+Image';
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" component="h3" gutterBottom noWrap>
                          {recipe.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {recipe.description}
                        </Typography>

                        <Box sx={{ mt: 'auto' }}>
                          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                            <Chip label={recipe.category} size="small" color="primary" />
                            <Chip label={recipe.cuisine} size="small" variant="outlined" />
                            <Chip 
                              label={recipe.difficulty} 
                              size="small" 
                              color={
                                recipe.difficulty === 'Easy' ? 'success' :
                                recipe.difficulty === 'Medium' ? 'warning' : 'error'
                              }
                            />
                          </Box>

                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Box display="flex" alignItems="center">
                              <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {(recipe.prepTime || 0) + (recipe.cookTime || 0)} mins
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center">
                              <Restaurant fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {recipe.servings || 1} servings
                              </Typography>
                            </Box>
                          </Box>

                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center">
                              <Rating value={recipe.averageRating || 0} precision={0.5} size="small" readOnly />
                              <Typography variant="caption" sx={{ ml: 1 }}>
                                ({recipe.reviewCount || 0})
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              By {recipe.author?.name || 'Unknown'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {data?.pagination?.pages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={data.pagination.pages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Recipes;