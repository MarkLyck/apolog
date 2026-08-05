import type { Metadata } from "next";

import { AuthPage } from "@/components/auth-page";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <AuthPage
      description="Create an account with an email and a password of at least eight characters."
      mode="signup"
      title="Sign up"
    />
  );
}
