import  { Router } from 'express';
import { login } from '../controllers/user.controller.js';

const app = Router()

app.route("/login").get(login)

export default app;