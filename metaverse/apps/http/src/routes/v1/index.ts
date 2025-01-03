import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { compare, hash } from "../../scrypt";
import client from "@repo/db/client";
import 'dotenv/config'
import { SignupSchema, SigninSchema } from '../../schema-types';
import jwt from "jsonwebtoken";

export const router = Router();

router.post('/signup', async (req, res) => {
    console.log('> inside signup')
    console.log('> signup req.body = ', req.body)
    const parsedData = SignupSchema.safeParse(req.body);
    console.log('> signup parsedData = ', parsedData)
    if (!parsedData.success) {
        res.status(400).json({ message: "Validation failed" });
        return;
    }
    const hashedPassword = await hash(parsedData.data.password);
    console.log('> signup hashedPassword = ', hashedPassword)
    try {
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.type === "admin" ? "Admin" : "User"
            }
        })
        console.log('> signup user = ', user)
        res.json({ userId: user.id })
    } catch (error) {
        console.log('> signup error = ', error)
        res.status(400).json({ message: "User already exists" })
    }
})

router.post('/signin', async (req, res) => {
    console.log('> inside signin')
    console.log('> signin req.body = ', req.body)
    const parsedData = SigninSchema.safeParse(req.body);
    console.log('> signin parsedData = ', parsedData)
    if (!parsedData.success) {
        res.status(403).json({ message: "Validation failed" })
        return
    }
    try {
        const user = await client.user.findUnique({
            where: {
                username: parsedData.data.username
            }
        })
        console.log('> signin user = ', user)
        if (!user) {
            res.status(403).json({ message: "User not found" })
            return
        }

        const isValid = await compare(parsedData.data.password, user.password)

        if (!isValid) {
            res.status(403).json({ message: "Invalid password" })
            return
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, process.env.JWT_SECRATE || 'JWT_SECRATE');
        console.log('> signin token = ', token)
        res.json({ token })
    } catch (e) {
        console.log('> signin error = ', e)
        res.status(400).json({ message: "Internal server error" })
    }
})

router.get('/elements', (req, res) => {
    res.json({ message: "elements" });
})
router.get('/avatars', (req, res) => {
    res.json({ message: "avatars" })
})

router.use('/user', userRouter);
router.use('/space', spaceRouter);
router.use('/admin', adminRouter);