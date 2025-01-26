
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import 'dotenv/config'

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1];

    if (!token) {
        res.status(403).json({ message: "Unauthorized" })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'someSuperSecretKey') as { role: string, userId: string, email: string }
        req.userId = decoded.userId
        next()
    } catch (e) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
}