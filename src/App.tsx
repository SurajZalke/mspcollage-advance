import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import { useEffect, lazy, Suspense } from "react";
const CreatorAttribution = lazy(() => import("./components/CreatorAttribution"));
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
import PlayerSetupPage from "./pages/PlayerSetupPage";
import ProfileSetup from "./components/ProfileSetup";
import { LeaderAnimationPage } from "./pages/LeaderAnimationPage";
import CreateQuizForm from "@/components/CreateQuizForm";
import PlayQuizPage from "./pages/PlayQuizPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
const TestAIExplanationPage = lazy(() => import("./pages/TestAIExplanationPage"));

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Enable dark mode by default for eye-catching effect.
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <GameProvider>
              <Toaster />
              <Sonner />
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
                <Route path="/player-setup" element={<PlayerSetupPage />} />
                <Route path="/leader-animation" element={<LeaderAnimationPage />} />
                <Route path="/mrdev-celebration" element={<LeaderAnimationPage />} />
                <Route path="/play-quiz" element={
                  <ProtectedRoute>
                    <PlayQuizPage />
                  </ProtectedRoute>
                } />
                <Route path="/create-quiz" element={<CreateQuizForm onClose={function (): void {
                  throw new Error("Function not implemented.");
                } } />} />
                <Route path="/play-quiz/:id" element={<PlayQuizPage />} />
                <Route path="/test-ai-explanation" element={<TestAIExplanationPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                
                {/* Catch-all route for 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </GameProvider>
          </AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <CreatorAttribution />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
export default App;
