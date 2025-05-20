
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import HostLoginPage from "./pages/HostLoginPage";
import HostSignupPage from "./pages/HostSignupPage";
import HostDashboardPage from "./pages/HostDashboardPage";
import HostGameRoomPage from "./pages/HostGameRoomPage";
import PlayerGameRoomPage from "./pages/PlayerGameRoomPage";
import JoinGamePage from "./pages/JoinGamePage";
import NotFound from "./pages/NotFound";
import ProfileSetup from "./components/ProfileSetup";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Enable dark mode by default for eye-catching effect.
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <GameProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/host-login" element={<HostLoginPage />} />
                <Route path="/host-signup" element={<HostSignupPage />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/host-dashboard" element={
                  <ProtectedRoute>
                    <HostDashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/host-game-room" element={
                  <ProtectedRoute>
                    <HostGameRoomPage />
                  </ProtectedRoute>
                } />
                <Route path="/game-room" element={<PlayerGameRoomPage />} />
                <Route path="/join" element={<JoinGamePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </GameProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
