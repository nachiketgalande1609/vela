import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123!'

  const hashed = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashed,
      role: 'ADMIN',
      emailVerified: new Date(), // pre-verified for the seed admin
    },
  })

  console.log(`✅ Seed admin created: ${admin.email}`)
  console.log(`   Password: ${adminPassword}`)
  console.log(`   Change this password immediately in production!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
