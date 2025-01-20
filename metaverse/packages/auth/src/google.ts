// packages/auth/src/google.ts
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

export class GoogleAuthService {
    private oauth2Client: OAuth2Client;

    constructor(
        private readonly db: any,
        private readonly jwtSecret: string,
        private readonly config: {
            clientId: string;
            clientSecret: string;
            redirectUri: string;
        }
    ) {
        this.oauth2Client = new OAuth2Client(
            config.clientId,
            config.clientSecret,
            config.redirectUri
        );
    }

    getAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ]
        });
    }

    async handleCallback(code: string) {
        // Exchange code for tokens
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        // Get user info
        const userinfo: any = await this.oauth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo'
        });

        // Find or create user
        const user = await this.db.user.upsert({
            where: { email: userinfo.data.email },
            update: {
                name: userinfo.data.name,
                picture: userinfo.data.picture
            },
            create: {
                email: userinfo.data.email,
                name: userinfo.data.name,
                picture: userinfo.data.picture,
                googleId: userinfo.data.id
            }
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            this.jwtSecret,
            { expiresIn: '24h' }
        );

        return { user, token };
    }
}