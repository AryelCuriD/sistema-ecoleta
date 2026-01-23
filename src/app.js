import express from 'express';
import connectDB from './config/database.js'

connectDB();

const app = express();
app.use(express.json());

export default app;