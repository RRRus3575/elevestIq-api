import express from 'express';

const app = express();

// app.use("/api/auth", authRouter)
app.use("/api/", );

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const {PORT = 3000} = process.env
const port = Number(PORT)

app.listen(port, () => {
  console.log(`Сервер работает: http://localhost:${port}`);
});
