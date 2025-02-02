import client from '@repo/db/client';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { GoogleAuthService } from '../../utils/google';

const googleAuth = new GoogleAuthService(process.env.JWT_SECRET!, {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!
});

export const authRouter = Router();

// Initiate Google OAuth flow
authRouter.get('/google', (req, res) => {
    const authUrl = googleAuth.getAuthUrl();
    res.redirect(authUrl);
});

// Handle OAuth callback
authRouter.get('/google/callback', async (req, res) => {
    try {
        const { user, token } = await googleAuth.handleCallback(req.query.code as string);
        res.redirect(
            `${process.env.FRONTEND_URL}/auth-callback?token=${encodeURIComponent(token)}`
        );
    } catch (error) {
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

        if (!process.env.JWT_SECRET) {
            res.status(403).json({ message: "Internal server error of JWT_SECRET missing" })
            return;
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; role: string };

        const user = await client.user.findUnique({
            where: {
                id: decodedToken.userId,
            },
            include: {
                avatar: true,
            },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({
            token,
            user: {
                email: user.email,
                role: user.role,
                avatarId: user.avatarId,
                imageUrl: user.avatar?.imageUrl,
            },
        });
    } catch (err: any) {
        console.error(err);
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token has expired' });
            return;
        }
        res.status(400).json({ message: 'Invalid token' });
        return;
    }
});