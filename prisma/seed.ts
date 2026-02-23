import 'dotenv/config';
import { prisma } from '../src/infrastructure/database/PrismaClient';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('123456', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@printcontrol.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@printcontrol.com',
      passwordHash,
    },
  });

  console.log(`✅ User created: ${user.name} (${user.email})`);
  console.log('🎉 Seed completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
