import express from "express";
import {
  loginUser,
  registerUser,
  userCredits,
} from "../controllers/user.controllers.js";
import { validateJWT } from "../middlewares/auth.middlewares.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/credits", validateJWT, userCredits);

export default userRouter;
