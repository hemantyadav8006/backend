import monogoose from "mongoose";

const patientSchema = new monogoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    diagonosedWith: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["M", "W", "O"],
      required: true,
    },
    admittedIn: {
      type: monogoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
  },
  { timestamps: true }
);

export const Petient = monogoose.model("Petient", patientSchema);
