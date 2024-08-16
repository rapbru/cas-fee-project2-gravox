import express from 'express';
import bodyParser from 'body-parser';
import plcRoutes from './routes/plc-routes.js';

const app = express();

app.use(bodyParser.json());

app.use("/plc", plcRoutes);

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('No token / Invalid token provided');
    } else {
        next(err);
    }
});

export default app;