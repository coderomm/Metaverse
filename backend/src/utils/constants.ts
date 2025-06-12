export const CORS_WHITELIST = process.env.CORS_ORIGIN?.split(',') ?? [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
];