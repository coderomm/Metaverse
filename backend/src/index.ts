import dotenv from 'dotenv'
// Load environment variables first, before any other imports
dotenv.config()
import express from 'express';
import cors from "cors";
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { router } from './routes/v1';
import { User } from './ws/User';
import { CORS_WHITELIST } from './utils/constants';

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);

app.use(express.json());
app.use(cors({
    origin: CORS_WHITELIST,
    credentials: true
}));

// const globalLimiter = rateLimit({
//     windowMs: 5 * 60 * 1000,
//     max: 15,
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use(globalLimiter);

const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
    console.log('WebSocket connection established.');

    let user = new User(ws);

    ws.on('error', console.error);

    ws.on('close', () => {
        user?.destroy();
        console.log('WebSocket connection closed.');
    });
});

app.get('/', (req, res) => {
  res.send('✅ Towny backend is up and running!');
});

app.use('/api/v1', router);

app.listen(PORT, () => {
    console.log(`🚀 Server running with REST and WS on PORT:${PORT}`);
});