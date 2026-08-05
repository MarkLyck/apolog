export type AuthMode = "login" | "signup";

export const authFormConfig = {
  login: {
    errorMessage: "The email or password is incorrect.",
    flow: "signIn",
    passwordAutoComplete: "current-password",
    pendingLabel: "Signing in…",
    submitLabel: "Sign in",
  },
  signup: {
    errorMessage:
      "Could not create the account. The email may already be registered.",
    flow: "signUp",
    passwordAutoComplete: "new-password",
    pendingLabel: "Creating account…",
    submitLabel: "Create account",
  },
} as const satisfies Record<AuthMode, AuthFormConfig>;

interface AuthFormConfig {
  errorMessage: string;
  flow: "signIn" | "signUp";
  passwordAutoComplete: "current-password" | "new-password";
  pendingLabel: string;
  submitLabel: string;
}

export function passwordConfirmationError(
  mode: AuthMode,
  password: FormDataEntryValue | null,
  confirmation: FormDataEntryValue | null
) {
  return mode === "signup" && password !== confirmation
    ? "Passwords do not match."
    : null;
}
