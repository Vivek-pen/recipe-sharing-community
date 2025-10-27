const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

    // Create default admin user
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    const adminExists = await User.findOne({ email: 'admin@recipe.com' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'Admin User',
        email: 'admin@recipe.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      
      console.log('👤 Default admin user created: admin@recipe.com / admin123');
    }

  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;