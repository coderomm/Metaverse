
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET || 'someSuperSecretKey';
console.log('JWT_SECRET === ', JWT_SECRET)

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(403).json({ error: 'No authorization header' });
        return;
    }

    console.error('authHeader = ', authHeader)

    const token = authHeader?.split(" ")[1];

    if (!token) {
        res.status(403).json({ message: "Unauthorized" })
        return
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { role: string, userId: string }
        if (decoded.role !== "Admin") {
            res.status(403).json({ message: 'Forbidden: Admin only' })
            return
        }
        req.userId = decoded.userId
        next()
    } catch (e) {
        console.error('Internal Error while creating map = ', e)
        res.status(401).json({ message: e })
        return
    }
}