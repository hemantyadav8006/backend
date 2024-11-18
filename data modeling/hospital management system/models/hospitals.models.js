import monogoose from "mongoose";

const hospitalSchema = new monogoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address1: {
      type: String,
      required: true,
    },
    address2: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    specializedIn: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const Hospital = monogoose.model("Hospital", hospitalSchema);
