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
        console.log('google user = ', user)
        console.log('google token = ', token)

        // Redirect to frontend with token
        res.redirect(`/auth-callback?token=${token}`);
    } catch (error) {
        res.redirect('/account/login?error=Authentication failed');
    }
});