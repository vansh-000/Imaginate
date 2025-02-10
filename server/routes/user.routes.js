import express from "express";
import {
  loginUser,
  registerUser,
  userCredits,
  paymentRazorpay,
  verifyRazorpay,
} from "../controllers/user.controllers.js";
import { validateJWT } from "../middlewares/auth.middlewares.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/credits", validateJWT, userCredits);
userRouter.post("/pay-razor", validateJWT, paymentRazorpay);
userRouter.post("/verify-razor", verifyRazorpay);

export default userRouter;
