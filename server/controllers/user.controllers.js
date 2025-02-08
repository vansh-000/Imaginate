import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const generateAccessAndRefreshToken = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError("Something went wrong", 500);
    }
    const accessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token Generation Error:", error);
    throw new ApiError(error.message || "Error creating tokens", 500);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError("All fields are required", 400);
  }

  const user = await User.findOne({ email });
  if (user) {
    throw new ApiError("Email already registered", 400);
  }

  const newUser = await User.create({ name, email, password });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    newUser._id
  );

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError("Error creating User", 404);
  }

  const cookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(
      new ApiResponse("User registered successfully", 201, {
        user: createdUser,
        tokens: { accessToken, refreshToken },
      })
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("Invalid email", 401);
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError("Invalid password", 401);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(
      new ApiResponse("User logged in successfully", 200, {
        user: safeUser,
        tokens: { accessToken, refreshToken },
      })
    );
});

const userCredits = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  const credits = user.creditBalance;
  return res.status(200).json(
    new ApiResponse("User credits fetched successfully", 200, {
      name: user.name,
      credits,
    })
  );
});


export { registerUser, generateAccessAndRefreshToken, userCredits, loginUser };
