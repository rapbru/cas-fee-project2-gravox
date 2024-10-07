import express from 'express';
import dotenv from 'dotenv';
import AuthController from '../controller/auth-controller.js';

dotenv.config();

const router = express.Router();

router.post('/login', AuthController.login);

export default router;
