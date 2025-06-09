
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config'

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Unauthorized: No authorization header" });
        return;
    }

    const token = authHeader?.split(" ")[1];

    if (!token) {
        res.status(403).json({ message: "Unauthorized" })
        return;
    }

    if (!process.env.JWT_SECRET) {
        console.error("❌ Missing JWT_SECRET environment variable.");
        res.status(500).json({ message: "Internal server error: JWT_SECRET is not configured" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string, role: string }
        if (decoded.role !== "Admin") {
            res.status(403).json({ message: "Forbidden: Admin access only" });
            return
        }
        req.userId = decoded.userId;
        next()
    } catch (error: any) {
        console.error("❌ JWT Verification Error:", error.message);

        if (error.name === "TokenExpiredError") {
            res.status(401).json({ message: "Unauthorized: Token has expired" });
            return;
        } else if (error.name === "JsonWebTokenError") {
            res.status(401).json({ message: "Unauthorized: Invalid token" });
            return;
        }

        res.status(500).json({ message: "Internal server error", error: error.message });
        return;
    }
}