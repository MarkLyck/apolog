import type { Metadata } from "next";

import { AuthPage } from "@/components/auth-page";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Log in",
};

export default function LoginPage() {
  return (
    <AuthPage
      description="Enter the email and password for your Apolog account."
      mode="login"
      title="Log in"
    />
  );
}
