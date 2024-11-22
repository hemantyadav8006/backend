import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // get the access token and then verify the token
    // get the data object from user with decodedToken
    // then add new object in the user and call next()
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorizied Request !");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // TODO : discuss about frontend
      throw new ApiError(401, "Invalid access Token !");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorizied Request !");
  }
});
