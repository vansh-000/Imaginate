import express from "express";
import { generateImage } from "../controllers/image.controllers.js";
import { validateJWT } from "../middlewares/auth.middlewares.js";

const imageRouter = express.Router();

imageRouter.post("/generate-image", validateJWT, generateImage);

export default imageRouter;
