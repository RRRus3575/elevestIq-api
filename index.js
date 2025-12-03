import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import idiomsRouter from "./routes/idiomsRouter.js";
import authRouter from "./routes/authRouter.js";
import adminRouter from "./routes/adminRouter.js";
import supportRouter from "./routes/supportRouter.js";
import termsRouter from "./routes/termsRouter.js";

const app = express();

// Если ты на Railway / Render за прокси
app.set("trust proxy", 1);

// --- SECURITY MIDDLEWARES ---

// Безопасные заголовки
app.use(helmet());

// CORS
const allowedOrigins = [
  "https://idiomoland.com",       // прод
  "https://www.idiomoland.com",   // если есть www
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // запросы без origin (Postman, curl) – разрешаем
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// --- RATE LIMITING ---

// Общий лимит на весь API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 минута
  max: 100,                  // 100 запросов с одного IP в минуту
  message: { message: "Too many requests, try again later" },
});

// Более жёсткий лимит на авторизацию
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 минут
  max: 20,                   // 20 запросов на IP
  message: { message: "Too many auth attempts, try again later" },
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// --- ROUTES ---

app.use("/api/auth", authRouter);
app.use("/api/idioms", idiomsRouter);
app.use("/api/support", supportRouter);
app.use("/api/terms", termsRouter);
app.use("/api/admin", adminRouter);

// --- 404 & ERROR HANDLERS ---

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err); // можно оставить для логов
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const { PORT = 8000 } = process.env;
const port = Number(PORT);

app.listen(port, () => {
  console.log(`Сервер работает: http://localhost:${port}`);
});
