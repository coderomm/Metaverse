import 'dotenv/config'
import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { compare, hash } from "../../utils/scrypt";
import client from "../../client";
import { SignupSchema, SigninSchema } from '../../schema-types';
import jwt from "jsonwebtoken";
import generateAvatar from '../../utils/avatar'
// import generateAvatar from '@repo/avatar-generate/generateAvatar'
import rateLimit from "express-rate-limit";
import { authRouter } from './auth';

export const router = Router();

if (!process.env.JWT_SECRET || !process.env.FRONTEND_URL) {
    console.error("❌ Missing required environment variables.");
    process.exit(1);
}

const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many signup attempts, please try again later.'
});

router.post('/signup', signupLimiter, async (req, res) => {
    try {
        const parsedData = SignupSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ message: "Signup Validation failed", errors: parsedData.error.format() });
            return;
        }

        const existingUser = await client.user.findFirst({ where: { email: parsedData.data.email } });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await hash(parsedData.data.password);
        const avatarRes = generateAvatar();
        const avatar = await client.avatar.create({ data: { imageUrl: avatarRes.url, name: avatarRes.name } });

        const user = await client.user.create({
            data: { email: parsedData.data.email, password: hashedPassword, role: parsedData.data.role, avatarId: avatar.id }
        });

        res.json({ userId: user.id });
    } catch (error: any) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts, please try again later.'
});

router.post('/signin', loginLimiter, async (req, res) => {
    try {
        const parsedData = SigninSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(403).json({ message: "Signin Validation failed", errors: parsedData.error.format() });
            return;
        }

        const user = await client.user.findUnique({
            where: { email: parsedData.data.email },
            include: { avatar: true }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isValid = await compare(parsedData.data.password, user.password!);
        if (!isValid) {
            res.status(403).json({ message: "Invalid password" });
            return;
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '72h' });

        res.json({
            token,
            user: { email: user.email, role: user.role, avatarId: user.avatarId, imageUrl: user.avatar?.imageUrl }
        });
    } catch (error: any) {
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


router.get("/elements", async (req, res) => {
    try {
        const elements = await client.element.findMany();
        res.json({ elements });
    } catch (error: any) {
        console.error("Error fetching elements:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.get("/avatars", async (req, res) => {
    try {
        const avatars = await client.avatar.findMany();
        res.json({ avatars });
    } catch (error: any) {
        console.error("Error fetching avatars:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.get("/maps", async (req, res) => {
    try {
        const maps = await client.map.findMany({ include: { mapElements: true } });
        res.json({
            maps: maps.map(map => ({
                id: map.id,
                name: map.name,
                width: map.width,
                height: map.height,
                thumbnail: map.thumbnail,
                mapElements: map.mapElements.map(e => ({
                    id: e.id,
                    mapId: e.mapId,
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y
                }))
            }))
        });
    } catch (error: any) {
        console.error("Error fetching maps:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.use('/user', userRouter);
router.use('/space', spaceRouter);
router.use('/admin', adminRouter);
router.use('/auth', authRouter);