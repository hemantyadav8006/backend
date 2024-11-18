import monogoose from "mongoose";

const medicalRecordSchema = new monogoose.Schema({}, { timestamps: true });

export const MedicalRecord = monogoose.model(
  "MedicalRecord",
  medicalRecordSchema
);
