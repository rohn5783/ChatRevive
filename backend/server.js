import connectDB from "./config/database.js";
import app from "./src/app.js";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const mongoConnected = await connectDB();

  app.listen(PORT, () => {
    const modeSuffix = mongoConnected
      ? ""
      : " with local auth fallback enabled";
    console.log(`Server started on port ${PORT}${modeSuffix}`);
  });
}

startServer();
