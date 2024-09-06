import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import plcRoutes from './routes/plc-routes.js';
import authRoutes from './routes/auth-routes.js';
import authToken from './auth-token.js';

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/plc", authToken, plcRoutes);

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('No token / Invalid token provided');
    } else {
        next(err);
    }
});

export default app;