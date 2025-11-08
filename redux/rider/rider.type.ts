export type CreateRiderPayload = {
  full_name: string;
  email: string;
  phone_number: string; // E.164
};

export type RiderState = {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};
