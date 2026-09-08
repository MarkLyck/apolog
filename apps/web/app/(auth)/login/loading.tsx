import { AuthPage } from "@/components/auth-page";

export default function Loading() {
  return (
    <AuthPage
      loading
      description="Enter the email and password for your Apolog account."
      mode="login"
      title="Log in"
    />
  );
}
