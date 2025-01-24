import client from '@repo/db/client';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { hash } from "./scrypt";
import { generateRandomPassword } from './generateRandomPassword';
import generateAvatar from '@repo/avatar-generate/generateAvatar';

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
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        const userinfoResponse: any = await this.oauth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo'
        });

        const userInfo = userinfoResponse.data as {
            id: string;
            email: string;
            name: string;
            picture: string;
        };

        const randomPassword: string = generateRandomPassword(16);
        const hashedPassword = await hash(randomPassword);

        const avatarRes = generateAvatar();
        const avatar = await client.avatar.create({
            data: {
                imageUrl: avatarRes.url,
                name: avatarRes.name
            }
        })

        const user = await client.user.upsert({
            where: { email: userInfo.email },
            update: {
                name: userInfo.name,
                picture: userInfo.picture,
            },
            create: {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                googleId: userInfo.id,
                password: hashedPassword,
                avatarId: avatar.id,
                role: 'User'
            }
        });

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            this.jwtSecret,
            { expiresIn: '48h' }
        );

        return { user, token };
    }
}