import client from "../../client";
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { GoogleAuthService } from '../../utils/google';

if (!process.env.JWT_SECRET || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI || !process.env.FRONTEND_URL) {
    console.error("❌ Missing required environment variables.");
    process.exit(1);
}

const googleAuth = new GoogleAuthService(process.env.JWT_SECRET!, {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!
});

export const authRouter = Router();

authRouter.get('/google', (req, res) => {
    try {
        const authUrl = googleAuth.getAuthUrl();
        res.redirect(authUrl);
    } catch (error) {
        console.error("Google Auth URL generation error:", error);
        res.status(500).json({ message: "Failed to generate Google authentication URL" });
    }
});

authRouter.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}/account/login?error=Missing authorization code`);
        }
        const { user, token } = await googleAuth.handleCallback(code as string);

        res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${encodeURIComponent(token)}`);
    } catch (error) {
        console.error("Google Auth callback error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/account/login?error=Authentication failed`);
    }
});

authRouter.post('/validate-token', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authorization header is missing or invalid' });
            return;
        }

        const token = authHeader.split(' ')[1];

        let decodedToken;
        if (!process.env.JWT_SECRET) {
            return;
        }
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; role: string };
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token has expired' });
                return;
            }
            res.status(400).json({ message: 'Invalid token' });
            return;
        }

        const user = await client.user.findUnique({
            where: { id: decodedToken.userId },
            include: { avatar: true },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({
            user: {
                email: user.email,
                role: user.role,
                avatarId: user.avatarId,
                imageUrl: user.avatar?.imageUrl,
            },
        });
    } catch (error) {
        console.error("Token validation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});