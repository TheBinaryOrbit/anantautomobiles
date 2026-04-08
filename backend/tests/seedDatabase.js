const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const setupDatabase = async () => {
  console.log('🌱 Seeding database with initial data...\n');

  try {
    // Create Admin User
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        password: adminPassword,
        phone: '9876543210',
        name: 'Admin User',
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create Regular User
    const userPassword = await bcrypt.hash('User@123', 10);
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@test.com' },
      update: {},
      create: {
        email: 'user@test.com',
        password: userPassword,
        phone: '9876543211',
        name: 'Test User',
        role: 'USER',
      },
    });
    console.log('✅ Regular user created:', regularUser.email);

    console.log('\n✅ Database seeded successfully!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
};

setupDatabase();
