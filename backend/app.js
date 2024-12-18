import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
// import path from 'path';

import plcRoutes from './routes/plc-routes.js';
import positionRoutes from './routes/position-routes.js';
import settingsRoutes from './routes/settings-routes.js';
import authRoutes from './routes/auth-routes.js';
import authToken from './auth-token.js';
import articleRoutes from './routes/article-routes.js';

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/plc", authToken, plcRoutes);
app.use("/position", authToken, positionRoutes);
app.use('/settings', authToken, settingsRoutes);
app.use('/article', authToken, articleRoutes);

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('No token / Invalid token provided');
    } else {
        next(err);
    }
});

// const dirname = path.resolve();
// app.use(express.static(path.join(dirname, 'dist/gravox/browser')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(dirname, 'dist/gravox/browser/index.html'));
// });

export default app;