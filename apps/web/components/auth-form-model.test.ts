import { describe, expect, test } from "bun:test";

import { authFormConfig, passwordConfirmationError } from "./auth-form-model";

describe("auth form model", () => {
  test("maps each route mode to the matching Convex Auth flow", () => {
    expect(authFormConfig.login.flow).toBe("signIn");
    expect(authFormConfig.signup.flow).toBe("signUp");
  });

  test("requires matching passwords only during sign up", () => {
    expect(passwordConfirmationError("signup", "one", "two")).toBe(
      "Passwords do not match."
    );
    expect(passwordConfirmationError("signup", "same", "same")).toBeNull();
    expect(passwordConfirmationError("login", "one", null)).toBeNull();
  });
});
