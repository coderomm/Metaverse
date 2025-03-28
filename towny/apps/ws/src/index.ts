    import { WebSocketServer } from 'ws';
    import { User } from './User';
    import 'dotenv/config'

    const wss = new WebSocketServer({ port: 3001 });

    wss.on('connection', function connection(ws) {
        console.log('New client connected');
        let user = new User(ws);
        ws.on('error', console.error);
        ws.on('close', () => {
            user?.destroy();
        })
    });