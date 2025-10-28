import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Button,
  Chip,
  Tab,
  Tabs,
  CardMedia,
  CardActionArea,
  Rating,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

  const { data: user, isLoading } = useQuery(['user', id], async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/${id}`);
    return res.data.data;
  });

  const { data: userRecipes } = useQuery(['userRecipes', id], async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/${id}/recipes`);
    return res.data.data;
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box className="main-content">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>Loading profile...</Typography>
        </Container>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="main-content">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>User not found.</Typography>
        </Container>
      </Box>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

  return (
    <Box className="main-content">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Profile Header */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  src={user.avatar && user.avatar !== 'default-avatar.jpg' ? `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/${user.avatar}` : undefined}
                  sx={{ width: 120, height: 120 }}
                >
                  {user.name?.[0]}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" component="h1" gutterBottom>
                  {user.name}
                </Typography>
                {user.bio && (
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {user.bio}
                  </Typography>
                )}
                <Box display="flex" gap={2} mb={2}>
                  <Typography variant="body2">
                    <strong>{user.recipeCount || 0}</strong> Recipes
                  </Typography>
                  <Typography variant="body2">
                    <strong>{user.followers?.length || 0}</strong> Followers
                  </Typography>
                  <Typography variant="body2">
                    <strong>{user.following?.length || 0}</strong> Following
                  </Typography>
                </Box>
                {user.location && (
                  <Typography variant="body2" color="text.secondary">
                    📍 {user.location}
                  </Typography>
                )}
                {user.website && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    🌐{' '}
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#ff6b35' }}
                    >
                      {user.website}
                    </a>
                  </Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  {isOwnProfile ? (
                    <Button variant="outlined" component={Link} to="/dashboard">
                      Edit Profile
                    </Button>
                  ) : (
                    <Button variant="contained">Follow</Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Recipes" />
            <Tab label="Favorites" />
            <Tab label="Following" />
            <Tab label="Followers" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Recipes ({userRecipes?.length || 0})
            </Typography>
            {userRecipes?.length === 0 ? (
              <Typography color="text.secondary">
                {isOwnProfile ? "You haven't shared any recipes yet." : "This user hasn't shared any recipes yet."}
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {userRecipes?.map((recipe) => (
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
                          <Typography variant="h6" component="h3" gutterBottom noWrap>
                            {recipe.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2, height: 40, overflow: 'hidden' }}
                          >
                            {recipe.description}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Chip label={recipe.category} size="small" color="primary" />
                            <Box display="flex" alignItems="center">
                              <Rating value={recipe.averageRating || 0} precision={0.5} size="small" readOnly />
                              <Typography variant="caption" sx={{ ml: 1 }}>
                                ({recipe.reviewCount || 0})
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {recipe.prepTime + recipe.cookTime} mins • {recipe.servings} servings
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

        {tabValue === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Favorite Recipes ({user.favorites?.length || 0})
            </Typography>
            {user.favorites?.length === 0 ? (
              <Typography color="text.secondary">
                {isOwnProfile ? "You haven't favorited any recipes yet." : "This user hasn't favorited any recipes yet."}
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {user.favorites?.map((recipe) => (
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
                          <Typography variant="h6" component="h3" gutterBottom noWrap>
                            {recipe.title}
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Rating value={recipe.averageRating || 0} precision={0.5} size="small" readOnly />
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              ({recipe.reviewCount || 0})
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Following ({user.following?.length || 0})
            </Typography>
            <Grid container spacing={2}>
              {user.following?.map((followedUser) => (
                <Grid item xs={12} sm={6} md={4} key={followedUser._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={followedUser.avatar && followedUser.avatar !== 'default-avatar.jpg' ? `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/${followedUser.avatar}` : undefined}
                          component={Link}
                          to={`/profile/${followedUser._id}`}
                        >
                          {followedUser.name?.[0]}
                        </Avatar>
                        <Typography
                          variant="subtitle1"
                          component={Link}
                          to={`/profile/${followedUser._id}`}
                          sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {followedUser.name}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Followers ({user.followers?.length || 0})
            </Typography>
            <Grid container spacing={2}>
              {user.followers?.map((follower) => (
                <Grid item xs={12} sm={6} md={4} key={follower._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={follower.avatar && follower.avatar !== 'default-avatar.jpg' ? `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/${follower.avatar}` : undefined}
                          component={Link}
                          to={`/profile/${follower._id}`}
                        >
                          {follower.name?.[0]}
                        </Avatar>
                        <Typography
                          variant="subtitle1"
                          component={Link}
                          to={`/profile/${follower._id}`}
                          sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {follower.name}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Profile;
