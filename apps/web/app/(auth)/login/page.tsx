import type { Metadata } from "next";

import { AuthPage } from "@/components/auth-page";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = next === "/admin/articles" ? next : "/";
  return (
    <AuthPage
      description="Enter the email and password for your Apolog account."
      mode="login"
      redirectTo={redirectTo}
      title="Log in"
    />
  );
}
