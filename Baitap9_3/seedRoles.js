const mongoose = require('mongoose');
const Role = require('./schemas/roles');

async function seedRoles() {
  try {
    await mongoose.connect('mongodb://localhost:27017/NNPTUD-C2');
    console.log('Connected to MongoDB');

    // Check if roles exist
    const existingAdmin = await Role.findOne({ name: 'ADMIN' });
    const existingMod = await Role.findOne({ name: 'MODERATOR' });

    if (!existingAdmin) {
      await Role.create({ name: 'ADMIN', description: 'Administrator with full access' });
      console.log('ADMIN role created');
    }

    if (!existingMod) {
      await Role.create({ name: 'MODERATOR', description: 'Moderator with read access' });
      console.log('MODERATOR role created');
    }

    console.log('Roles seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();