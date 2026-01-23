import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Conectado 🙉');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

export default connectDB;