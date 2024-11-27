import mongoose, { Schema } from "mongoose";

const commentSchema = Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    videos: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  },
  { timestamp: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
