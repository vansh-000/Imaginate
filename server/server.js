import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("🔴 Error interacting with database: ", error);
    });
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🟢 Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("🔴 MongoDB connection failed !!!", error);
  });
