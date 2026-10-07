import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"

const app = express();

// DB
connectDB();

// Middleware
app.use(cors())
app.use(express.json());

// APIs
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);


const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});