import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import razorpay from "razorpay";
import { Transaction } from "../models/transaction.model.js";

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

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const userId = req.user;
  if (!userId || !planId) {
    throw new ApiError("Missing Details", 400);
  }
  const userData = await User.findById(userId);
  if (!userData) {
    throw new ApiError("User not found", 404);
  }
  let credits, plan, amount, date;
  switch (planId) {
    case "Basic":
      plan = "Basic";
      credits = 100;
      amount = 10;
      break;
    case "Advanced":
      plan = "Advanced";
      credits = 500;
      amount = 50;
      break;
    case "Business":
      plan = "Business";
      credits = 5000;
      amount = 250;
      break;
    default:
      return res.status(400).json(
        new ApiResponse("Something went Wrong in choosing a Plan", 400, {
          message: "Something went Wrong in choosing a Plan",
        })
      );
  }
  date = Date.now();

  const transactionData = {
    userId,
    plan,
    amount,
    credits,
    date,
  };
  const newTransaction = await Transaction.create(transactionData);

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: newTransaction._id,
  };

  const payment = await razorpayInstance.orders.create(
    options,
    (error, order) => {
      if (error) {
        return res.status(400).json(
          new ApiResponse("Something went Wrong in Payment", 400, {
            message: "Something went Wrong in Payment",
          })
        );
      }
      res.json({ success: true, order });
    }
  );
});

const verifyRazorpay = asyncHandler(async (req, res) => {
  const { razorpay_order_id } = req.body;
  const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
  if (orderInfo.status === "paid") {
    const transaction = await Transaction.findOneTransaction.findOne({
      _id: orderInfo.receipt,
    });
    if (transaction.payment) {
      return res.json({
        success: false,
        message: "Payment failed",
      });
    }
    const userData = await User.findById(transaction.userId);
    const newBalance = userData.creditBalance + transaction.credits;
    await User.findByIdAndUpdate(userData._id, { creditBalance });
    await Transaction.findByIdAndUpdate(transaction._id, {
      payment: true,
    });
    res.json({ success: true, message: "Credits added" });
  } else {
    res.json({ success: false, message: "Payment failed" });
  }
});

export {
  registerUser,
  generateAccessAndRefreshToken,
  userCredits,
  loginUser,
  paymentRazorpay,
  verifyRazorpay,
};
