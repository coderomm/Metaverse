import express, { Application } from 'express';
import { router } from './routes/v1';
import cors from "cors";

const app = express();
app.use(express.json());

const allowedOrigins = [
    `${process.env.FRONTEND_URL}`,
    'http://localhost:5173'
];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// const globalLimiter = rateLimit({
//     windowMs: 5 * 60 * 1000,
//     max: 15,
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use(globalLimiter);

app.use('/api/v1', router);

app.listen(process.env.PORT || 3000, () => {
    console.log('http listening on 3000...')
});