
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import 'dotenv/config'

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1];

    if (!token) {
        res.status(403).json({ message: "Unauthorized: Token missing!" })
        return
    }

    if (!process.env.JWT_SECRET) {
        res.status(403).json({ message: "Internal server error of JWT_SECRET missing" })
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string, role: string }
        req.userId = decoded.userId
        next()
    } catch (e) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
}