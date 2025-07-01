import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import BackgroundContainer from "@/components/BackgroundContainer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogIn, Play, Settings, Users } from "lucide-react";
import CreatorAttribution from "@/components/CreatorAttribution";
import FadeInOnScroll from '@/components/FadeInOnScroll';
// Google site verification should be in a meta tag in the HTML head, not in the TSX file
<>
  // Google site verification should be in a meta tag in the HTML head, not in the TSX file
  <title>MSP Collage Advance - Home</title><><meta name="google-site-verification" content="pkmknusJfsYMLKfeycQLKDeW4-r8vtXU_1U9YYePvQU" />
    <meta name="description" content="MSP Collage Advance is a smart student platform with modern tools, learning features, and official updates for MSP students." />
    <meta name="keywords" content="MSP Collage Advance, Student Platform, College App, Study Tool" />
  </><><meta name="google-site-verification" content="pkmknusJfsYMLKfeycQLKDeW4-r8vtXU_1U9YYePvQU" /><meta name="description" content="MSP Collage Advance is a smart student platform with modern tools, learning features, and official updates for MSP students." /><meta name="keywords" content="MSP Collage Advance, Student Platform, College App, Study Tool" /></></>

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleHostClick = () => {
    if (currentUser) {
      navigate("/host-dashboard");
    } else {
      navigate("/host-login");
    }
  };

  const handleJoinClick = () => {
    navigate("/join");
  };

  return (
    <><BackgroundContainer className="homepage-background">
      <div className="min-h-screen flex flex-col">
        <header className="bg-white/10 dark:bg-gray-900/60 shadow backdrop-blur-sm">
          <div className="container mx-auto p-4 flex justify-between items-center">
            <Logo />

            {currentUser ? (
              <div className="space-x-2">
                <Button
                  variant="ghost"
                  className="dark:text-white dark:hover:bg-white/10"
                  onClick={() => navigate("/host-dashboard")}
                >
                  Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Button
                  variant="ghost"
                  className="dark:text-white dark:hover:bg-white/10"
                  onClick={() => navigate("/host-login")}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => navigate("/host-signup")}
                >
                  Host Sign Up
                </Button>
              </div>
            )}
          </div>
        </header>

        <main className="container mx-auto flex-1 flex flex-col justify-center items-center p-4">
          <div className="text-center mb-4 animate-fade-in">
            <h1 className="text-5xl font-bold gradient-heading mb-4">Interactive Science Quiz Platform</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Create and participate in engaging science quizzes for high school students.
              Perfect for classroom activities or remote learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
            <div className="quiz-card p-8 text-center transform hover:scale-105 transition-all duration-300 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:shadow-xl border border-indigo-100 dark:border-indigo-900/50">
              <div className="mb-4">
                <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/50 w-16 h-16 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Join as Player</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Enter a game code to join a quiz as a player. Compete with others and test your knowledge!
              </p>
              <Button onClick={handleJoinClick} className="quiz-btn-primary w-full">
                <Play className="h-4 w-4 mr-2" />
                Join Game
              </Button>
            </div>

            <div className="quiz-card p-8 text-center transform hover:scale-105 transition-all duration-300 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:shadow-xl border border-indigo-100 dark:border-indigo-900/50">
              <div className="mb-4">
                <div className="mx-auto bg-purple-100 dark:bg-purple-900/50 w-16 h-16 rounded-full flex items-center justify-center">
                  <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Host a Game</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create your own quiz, invite players, and host an interactive learning session.
              </p>
              <Button onClick={handleHostClick} className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                {currentUser ? 'Go to Dashboard' : 'Host Sign In'}
              </Button>
            </div>
          </div>
        </main>
      </div>
      <div className="p-4 text-white">
        <h2 className="text-3xl font-bold text-center mb-4">About Us</h2>
        <h3 className="text-2xl font-bold text-center mb-4">Our Esteemed Faculty</h3>

        {/* Principal's Section */}
        <FadeInOnScroll className="flex flex-col items-center mb-2">
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg mb-4">
            <img src="/principal.jpeg" alt="Principal" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-2xl font-semibold">Dr. N. S. Thakare Sir</h3>
          <p className="text-lg text-dark text-black-400 mb-4">"Since 1986 we are developing quailitatively and quanititatively. College has given special attention towards student's educational & cultural development, under the valuable guidance of board of directors, with the coordination of faculties, employees, students and parents, we have developed impressive college building, modern laboratories, computer department, huge premises, well equiped library, sports ground and Matoshri garden."</p>

          <a href="https://www.mspkptmanora.ac.in/" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105">Visit College Website🎓🎓</a>
        </FadeInOnScroll>

        {/* Subjects Section */}
        <FadeInOnScroll className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mt-2">
          {/* Subject 1 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-md">
            <h4 className="text-xl font-bold mb-4">Mathematics</h4>
            <div className="space-y-6">
              {/* Teacher 1 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400">
                  <img src="/math_teacher1.jpg" alt="Math Teacher 1" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Prof.Ram Chavhan </p>
                  <p className="text-sm text-gray-400">10+ Years Experience</p>
                </div>
              </div>
              {/* Teacher 2 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400">
                  <img src="/math_teacher2.jpg" alt="Math Teacher 2" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Prof.Ashitosh Thakare</p>
                  <p className="text-sm text-gray-400">10+ Years Experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subject 2 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-md">
            <h4 className="text-xl font-bold mb-4">Biology</h4>
            <div className="space-y-6">
              {/* Teacher 1 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-400">
                  <img src="/science_teacher1.jpg" alt="Science Teacher 1" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Prof.S.A.Kale</p>
                  <p className="text-sm text-gray-400">20+ Years Experience</p>
                </div>
              </div>
              {/* Teacher 2 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-400">
                  <img src="/science_teacher2.jpg" alt="Science Teacher 2" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Prof.Thamevr</p>
                  <p className="text-sm text-gray-400">15+ Years Experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subject 3 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-md">
            <h4 className="text-xl font-bold mb-4">Chemistry</h4>
            <div className="space-y-6">
              {/* Teacher 1 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-400">
                  <img src="/chemistry_teacher1.jpg" alt="Chemistry Teacher 1" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Prof.P.D.Raut</p>
                  <p className="text-sm text-gray-400">20+ Years Experience</p>
                </div>
              </div>
              {/* Teacher 2 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-400">
                  <img src="/chemistry_teacher2.jpg" alt="Chemistry Teacher 2" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Prof.V.D.Dhole</p>
                  <p className="text-sm text-gray-400">20+ Years Experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subject 4 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-md">
            <h4 className="text-xl font-bold mb-4">Physics</h4>
            <div className="space-y-6">
              {/* Teacher 1 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400">
                  <img src="/physics_teacher1.jpg" alt="Physics Teacher 1" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Prof.S.P.Deshmukh</p>
                  <p className="text-sm text-gray-400">25+ Years Experience</p>
                </div>
              </div>
              {/* Teacher 2 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400">
                  <img src="/physics_teacher2.jpg" alt="Physics Teacher 2" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Prof.V.R.Dable</p>
                  <p className="text-sm text-gray-400">20+ Years Experience</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subject 5 */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-md">
            <h4 className="text-xl font-bold mb-4">Our Supporter</h4>
            <div className="space-y-6">
              {/* Teacher 1 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400">
                  <img src="/english_teacher1.jpg" alt="English Teacher 1" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Prof.Ganjre sir</p>
                  <p className="text-sm text-gray-400">20+ Years Experience</p>
                </div>
              </div>
              {/* Teacher 2 */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400">
                  <img src="/english_teacher2.jpg" alt="English Teacher 2" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Prof.Waghmare sir</p>
                  <p className="text-sm text-gray-400">20+ Years Experience</p>
                </div>
              </div>
            </div>
          </div>
        </FadeInOnScroll>
      </div>
      <CreatorAttribution />
      <Footer />
    </BackgroundContainer></>
  );
};
const Footer = () => {
  return (
    <footer className="py-4 bg-gray-800 text-white">
      <div className="container mx-auto text-center text-gray-600 dark:text-gray-400 text-sm">
        <div className="flex justify-center items-center">
          <div className="mr-4">
            <Link to="/privacy-policy" className="text-white hover:underline">
              Privacy Policy
            </Link>
          </div>
          <div className="mr-4">
            <Link to="/terms-of-service" className="text-white hover:underline">
              Terms of Service
            </Link>
          </div>
          <div className="mr-4">
            <Link to="/contact" className="text-white hover:underline">
              Contact Us: mspcollage724@gmail.com
            </Link>
          </div>
        </div>

        <p>© 2025 Science Quiz Platform — Interactive learning tool for science education</p>
      </div>
    </footer>
  );
};

export default HomePage;
