import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const validateJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers?.accesstoken;
  if (!token) {
    throw new ApiError("Access token missing. Unauthorized access.", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError("User not found. Invalid access token.", 401);
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError("Access token expired. Please log in again.", 401);
    } else if (error.name === "JsonWebTokenError") {
      throw new ApiError("Invalid access token. Authentication failed.", 401);
    } else {
      throw new ApiError("Authentication error. Please try again.", 500);
    }
  }
});
