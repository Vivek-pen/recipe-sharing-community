import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  TextField,
  Tab,
  Tabs,
  CardMedia,
  CardActionArea,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const { data: myRecipes, refetch: refetchRecipes } = useQuery(
    ['myRecipes', user?._id],
    async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/${user._id}/recipes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data.data;
    },
    { enabled: !!user }
  );

  const { data: favorites } = useQuery(
    'favorites',
    async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
    { enabled: !!user }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (recipeToDelete) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/recipes/${recipeToDelete._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        refetchRecipes();
        setDeleteDialogOpen(false);
        setRecipeToDelete(null);
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRecipeToDelete(null);
  };

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box className="main-content">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Profile Overview */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  src={user.avatar && user.avatar !== 'default-avatar.jpg' ? `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/${user.avatar}` : undefined}
                  sx={{ width: 80, height: 80 }}
                >
                  {user.name?.[0]}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {user.name}!
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Manage your recipes and profile
                </Typography>
                <Box display="flex" gap={2} mt={2}>
                  <Button variant="contained" component={Link} to="/create-recipe" startIcon={<Add />}>
                    Create New Recipe
                  </Button>
                  <Button variant="outlined" startIcon={<Edit />}>
                    Edit Profile
                  </Button>
                </Box>
              </Grid>
              <Grid item>
                <Grid container spacing={2} textAlign="center">
                  <Grid item>
                    <Typography variant="h6">{myRecipes?.length || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recipes
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h6">{user.followers?.length || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Followers
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h6">{user.following?.length || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Following
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="My Recipes" />
            <Tab label="Favorites" />
            <Tab label="Profile Settings" />
          </Tabs>
        </Box>

        {/* My Recipes Tab */}
        {tabValue === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">My Recipes ({myRecipes?.length || 0})</Typography>
              <Button variant="contained" component={Link} to="/create-recipe" startIcon={<Add />}>
                Add New Recipe
              </Button>
            </Box>

            {myRecipes?.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" gutterBottom>
                    You haven't created any recipes yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Share your culinary creations with the community!
                  </Typography>
                  <Button variant="contained" component={Link} to="/create-recipe">
                    Create Your First Recipe
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {myRecipes?.map((recipe) => (
                  <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                    <Card>
                      <Box sx={{ position: 'relative' }}>
                        <CardActionArea component={Link} to={`/recipes/${recipe._id}`}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={
                              recipe.image !== 'default-recipe.jpg'
                                ? `http://localhost:5000/uploads/${recipe.image}`
                                : '/default-recipe.jpg'
                            }
                            alt={recipe.title}
                          />
                        </CardActionArea>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 1,
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                            component={Link}
                            to={`/edit-recipe/${recipe._id}`}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                            onClick={() => handleDeleteClick(recipe)}
                          >
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                      </Box>
                      <CardContent>
                        <Typography variant="h6" gutterBottom noWrap>
                          {recipe.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {recipe.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created {new Date(recipe.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Favorites Tab */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Favorite Recipes ({favorites?.length || 0})
            </Typography>

            {favorites?.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" gutterBottom>
                    No favorite recipes yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Browse recipes and save your favorites!
                  </Typography>
                  <Button variant="contained" component={Link} to="/recipes">
                    Browse Recipes
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {favorites?.map((recipe) => (
                  <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                    <Card className="recipe-card">
                      <CardActionArea component={Link} to={`/recipes/${recipe._id}`}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={
                            recipe.image !== 'default-recipe.jpg'
                              ? `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/${recipe.image}`
                              : '/default-recipe.jpg'
                          }
                          alt={recipe.title}
                        />
                        <CardContent>
                          <Typography variant="h6" gutterBottom noWrap>
                            {recipe.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            By {recipe.author?.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Profile Settings Tab */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Profile Settings
            </Typography>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      defaultValue={user.name}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      defaultValue={user.email}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={3}
                      defaultValue={user.bio}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      defaultValue={user.location}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      defaultValue={user.website}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <Button variant="contained" sx={{ mr: 2 }}>
                    Save Changes
                  </Button>
                  <Button variant="outlined">Cancel</Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Recipe</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{recipeToDelete?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;
