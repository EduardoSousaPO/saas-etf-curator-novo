import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/layout/Navbar";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <AuthForm />
    </div>
  );
}

