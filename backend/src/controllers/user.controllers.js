import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Subscription } from "../models/subscription.models.js";
import mongoose, { mongo } from "mongoose";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went wrong while generating access and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //   res.status(200).json({
  //     message: "Ok",
  //   });

  // to register user

  // get user details from front-end
  // validate (not empty)
  // check if user already exist (check : unique email and username)
  // check for image, check: avatar required
  // upload in cloudinary, avatar required
  // create user object - create db entry
  // remove password and refresh token from the response
  // check if user is registered perfectly or a null user is register
  // return res

  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) throw new ApiError(409, "Email or username already exist");

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) throw new ApiError(400, "Avatar required");

  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar required");

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the user !"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // for login
  // get data from front end
  // validate data check: for empty
  // check if user exist in the database
  // check isPasswordCorrect
  // generate access and refresh token and send via cookie

  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(404, "Email or Username is required !!");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User not exist !");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Password incorrect !");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In successfully !"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // clear refreshToken and cookies
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully !!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refreshToken from cookies or body
  // verify the incomingRefreshToken with the jwt verify method
  // get the user data from the decodedToken id
  // again check the incomingRefreshToken and the stored refreshToken in the database
  // now generate accessToken and refreshToken
  // return the res with new cookie of accessToken and refreshToken

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Token Not Found!");

  try {
    const decodeedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeedToken?._id);
    if (!user) throw new ApiError(401, "Invalid Refresh Token");

    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Invalid Refresh Token or Token Expired");

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", newRefreshToken)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            newRefreshToken,
          },
          "Access Token Refreshed !!"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Unauthorized Request!");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // get the oldPassword and newPassword from req.body
  // get the user from the auth.middleware
  // check the oldPassword with isPasswordCorrect method
  // set new password and save the user with await
  // return res
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(401, "Password is incorrect !");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "New Password Save Successfully !"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current User Fetched Successfully !")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!(fullName || email)) throw new ApiError(400, "All fields are required!");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullName: fullName, email: email },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully !"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file required!");

  const avatar = await uploadCloudinary(avatarLocalPath);
  if (!avatar.url)
    throw new ApiError(400, "Error while uploading on cloudinary!");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar is updated Successfully!"));
});

const updatecoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath)
    throw new ApiError(400, "CoverImage file required!");

  const coverImage = await uploadCloudinary(coverImageLocalPath);
  if (!coverImage.url)
    throw new ApiError(400, "Error while uploading on cloudinary!");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image is updated Successfully!"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) throw new ApiError(400, "username is missing!");

  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        createdAt: 1,
      },
    },
  ]);

  // console.log(channel);
  if (!channel?.length) throw new ApiError(404, "Channel Doesn't exist");

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully !")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "Video",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          // sub-pipeline for getting owner
          {
            $lookup: {
              from: "User",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                // sub-pipeline for projection of data
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched successfully !"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updatecoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
