
import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import HostLoginForm from "@/components/HostLoginForm";
import BackgroundContainer from "@/components/BackgroundContainer";

const HostLoginPage: React.FC = () => {
  return (
    <BackgroundContainer>
      <header className="container mx-auto p-4">
        <Link to="/" className="inline-block">
          <Logo />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md transform hover:scale-[1.01] transition-all duration-500">
          <HostLoginForm />
        </div>
      </div>
      <footer className="container mx-auto p-4 text-center text-white text-sm">
        <p>&copy; {new Date().getFullYear()} Science Stream Quiz Arena</p>
      </footer>
    </BackgroundContainer>
  );
};

export default HostLoginPage;
