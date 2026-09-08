import { AuthPage } from "@/components/auth-page";

export default function Loading() {
  return (
    <AuthPage
      loading
      description="Create an account with an email and a password of at least eight characters."
      mode="signup"
      title="Sign up"
    />
  );
}
