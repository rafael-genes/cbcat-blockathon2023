import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log(`Start seeding ...`)

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminAddress = process.env.ADMIN_ADDRESS

    if (!adminEmail || !adminPassword || !adminAddress) {
        console.log(`ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ADDRESS must be set.`)
        console.log(`Seeding finished.`)
        return
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: adminEmail
        }
    })

    if (existingUser) {
        console.log(`User already exists.`)
        console.log(`Seeding finished.`)
        return
    }

    const hashedPassword = await hash(adminPassword, 10)
    const user = await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            address: adminAddress,
            role: "admin"
        }
    })
    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
