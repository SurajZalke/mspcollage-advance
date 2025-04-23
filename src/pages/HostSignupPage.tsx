
import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import HostSignupForm from "@/components/HostSignupForm";

const HostSignupPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col gradient-animated-bg dark:bg-none dark:bg-gradient-to-br dark:from-[#1a1f2c] dark:via-[#31137c] dark:to-[#b09cff]">
      <header className="container mx-auto p-4">
        <Link to="/" className="inline-block">
          <Logo />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md transform hover:scale-[1.01] transition-all duration-500">
          <HostSignupForm />
        </div>
      </div>
      <footer className="container mx-auto p-4 text-center text-gray-500 dark:text-gray-300 text-sm">
        <p>&copy; {new Date().getFullYear()} Science Stream Quiz Arena</p>
      </footer>
    </div>
  );
};

export default HostSignupPage;
