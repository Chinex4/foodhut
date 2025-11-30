export type StepKey = "vehicle" | "documents" | "contact";

export const steps: StepKey[] = ["vehicle", "documents", "contact"];

export type UploadFile = {
  id: string;
  uri: string;
  name: string;
  sizeLabel: string;
};
