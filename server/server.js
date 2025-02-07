import express from "express";
import cors from "cors";
import "dotenv/config";

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("API Working !!!"));

app.listen(port, () => console.log(`Server is running on port ${port}`));
