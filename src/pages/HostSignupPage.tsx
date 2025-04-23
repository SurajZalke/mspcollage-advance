
import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import HostSignupForm from "@/components/HostSignupForm";

const HostSignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col">
      <header className="container mx-auto p-4">
        <Link to="/" className="inline-block">
          <Logo />
        </Link>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <HostSignupForm />
        </div>
      </div>
      
      <footer className="container mx-auto p-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Science Stream Quiz Arena</p>
      </footer>
    </div>
  );
};

export default HostSignupPage;
