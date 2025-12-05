import express from 'express';
import authRouter from './routes/authRouter.js';
import cookieParser from "cookie-parser";
import profileRouter from './routes/profileRouter.js';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter)
app.use("/api/profiles", profileRouter)


app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const {PORT = 5000} = process.env
const port = Number(PORT)

app.listen(port, () => {
  console.log(`Server is running: http://localhost:${port}`);
});