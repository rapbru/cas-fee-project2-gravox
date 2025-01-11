import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';

import plcRoutes from './routes/plc-routes.js';
import positionRoutes from './routes/position-routes.js';
import settingsRoutes from './routes/settings-routes.js';
import authRoutes from './routes/auth-routes.js';
import authToken from './auth-token.js';
import articleRoutes from './routes/article-routes.js';

const app = express();
const dirname = path.resolve();
const appFolder = path.join(dirname, '../frontend/dist/gravox/browser');

const options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['html', 'js', 'scss', 'css'],
    index: false,
    maxAge: '1y',
    redirect: true
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use("/auth", authRoutes);
app.use("/plc", authToken, plcRoutes);
app.use("/position", authToken, positionRoutes);
app.use('/settings', authToken, settingsRoutes);
app.use('/article', authToken, articleRoutes);

// Frontend serving
app.use(express.static(appFolder, options));

// Serve angular paths
app.all('*', (req, res) => {
    res.status(200).sendFile('index.html', { root: appFolder });
});

export default app;