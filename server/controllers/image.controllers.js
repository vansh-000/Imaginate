import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import FormData from "form-data";
import axios from "axios";

export const generateImage = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user?._id;

  if (!prompt) {
    return res.status(400).json(new ApiError("Prompt is required", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiError("User not found", 404));
  }

  if (user.creditBalance <= 0) {
    return res.status(400).json(
      new ApiError("Insufficient credit balance", 400, {
        creditBalance: user.creditBalance,
      })
    );
  }

  // IMAGE GENERATION
  const formData = new FormData();
  formData.append("prompt", prompt);

  try {
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;

    const updatedCreditBalance = user.creditBalance - 1;
    await User.findByIdAndUpdate(user._id, {
      creditBalance: updatedCreditBalance,
    });

    return res.status(200).json({
      success: true,
      message: "Image Generated",
      creditBalance: updatedCreditBalance,
      resultImage,
    });
  } catch (error) {
    console.error("Image generation failed:", error);
    throw new ApiError(
      "Failed to generate image. Please try again later.",
      500
    );
  }
});
