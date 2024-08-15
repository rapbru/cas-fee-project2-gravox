import express from 'express';
import bodyParser from 'body-parser';

import { plcRoutes } from './routes/plc-routes.js';

export const app = express();

app.use(bodyParser.json());

app.use("/plc", plcRoutes);

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('No token / Invalid token provided');
    } else {
        next(err);
    }
});