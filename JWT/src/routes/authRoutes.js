import { Router } from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const authRoutes = Router();

authRoutes.post('/register', authController.criar);
authRoutes.post('/login', authController.login);

authRoutes.get('/users',authController.users);

export default authRoutes;