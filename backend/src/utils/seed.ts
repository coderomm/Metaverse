import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { hash } from './scrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seeding...");

    /** ✅ 1. Seeding Avatars */

    const avatar1 = await prisma.avatar.create({
        data: { imageUrl: 'https://towny-2d.s3.ap-south-1.amazonaws.com/avatars/avatar1.png', name: 'Uzieee' }
    });

    const avatar2 = await prisma.avatar.create({
        data: { imageUrl: 'https://towny-2d.s3.ap-south-1.amazonaws.com/avatars/avatar2.png', name: 'Niyo' }
    });

    const avatar3 = await prisma.avatar.create({
        data: { imageUrl: 'https://towny-2d.s3.ap-south-1.amazonaws.com/avatars/avatar3.png', name: 'Hacky' }
    });

    console.log("✅ Avatars seeded.");

    /** ✅ 2. Seeding Admin Users */
    const adminEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',') || [];

    if (adminEmails.length === 0) {
        console.error("❌ No admin emails found in ALLOWED_ADMIN_EMAILS.");
        return;
    }

    for (const [index, email] of adminEmails.entries()) {
        const hashedPassword = await hash(process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123');

        await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: hashedPassword,
                role: "Admin",
                avatarId: index === 0 ? avatar1.id : index === 1 ? avatar2.id : avatar3.id
            }
        });

        console.log(`✅ Admin user seeded: ${email}`);
    }

    /** ✅ 3. Seeding Elements */
    const element1 = await prisma.element.create({
        data: { width: 100, height: 100, static: false, imageUrl: 'https://towny-2d.s3.ap-south-1.amazonaws.com/elements/Object_1.png' }
    });

    const element2 = await prisma.element.create({
        data: { width: 150, height: 300, static: true, imageUrl: 'https://towny-2d.s3.ap-south-1.amazonaws.com/elements/Object_2.png' }
    });

    const element3 = await prisma.element.create({
        data: { width: 90, height: 90, static: false, imageUrl: 'https://towny-2d.s3.ap-south-1.amazonaws.com/elements/Object_3.png' }
    });

    const element4 = await prisma.element.create({
        data: { width: 100, height: 200, static: true, imageUrl: 'https://towny-2d.s3.ap-south-1.amazonaws.com/elements/Object_4.png' }
    });

    console.log("✅ Elements seeded.");

    /** ✅ 4. Seeding Maps */
    await prisma.map.create({
        data: {
            name: "Sample Map",
            width: 500,
            height: 500,
            thumbnail: "https://towny-2d.s3.ap-south-1.amazonaws.com/maps/map1.jpg",
            mapElements: {
                create: [
                    { elementId: element1.id, x: 1, y: 2 },
                    { elementId: element2.id, x: 3, y: 4 },
                    { elementId: element3.id, x: 5, y: 6 },
                    { elementId: element4.id, x: 7, y: 8 },
                ]
            }
        }
    });

    console.log("✅ Map seeded.");

    console.log("🎉 Seeding completed successfully!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error("❌ Seeding failed:", error);
        await prisma.$disconnect();
        process.exit(1);
    });
