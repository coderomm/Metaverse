import client from '@repo/db/client';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { compare, hash } from "./scrypt";
import { generateRandomPassword } from './generateRandomPassword';

export class GoogleAuthService {
    private oauth2Client: OAuth2Client;

    constructor(
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
        const userinfoResponse: any = await this.oauth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo'
        });

        const userinfo = userinfoResponse.data as {
            id: string;
            email: string;
            name: string;
            picture: string;
        };

        console.log('G-Aauth userinfo = ', userinfo)

        const randomPassword: string = generateRandomPassword(16);
        const hashedPassword = await hash(randomPassword);

        const user = await client.user.upsert({
            where: { email: userinfo.email },
            update: {
                name: userinfo.name,
                picture: userinfo.picture
            },
            create: {
                email: userinfo.email,
                name: userinfo.name,
                picture: userinfo.picture,
                googleId: userinfo.id,
                password: hashedPassword,
                role: 'User'
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