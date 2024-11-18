import monogoose from "mongoose";

const doctorSchema = new monogoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experienceYear: {
      type: Number,
      default: 0,
    },
    worksInHospitals: {
      type: monogoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
  },
  { timestamps: true }
);

export const Doctor = monogoose.model("Doctor", doctorSchema);
