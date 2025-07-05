import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import BackgroundContainer from "@/components/BackgroundContainer";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Play, Settings, Users } from "lucide-react";
import { Helmet } from "react-helmet";

// Lazy-loaded components
const FadeInOnScroll = React.lazy(() => import('@/components/FadeInOnScroll'));
const CreatorAttribution = React.lazy(() => import('@/components/CreatorAttribution'));


const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleHostClick = () => {
    navigate(currentUser ? "/host-dashboard" : "/host-login");
  };

  const handleJoinClick = () => {
    navigate("/join");
  };

  return (
    <>
      <Helmet>
        <title>MSP College Advance - Home</title>
        <meta name="description" content="MSP College Advance is a smart student platform with modern tools, learning features, and official updates for MSP students." />
        <meta name="keywords" content="MSP College Advance, Student Platform, College App, Study Tool" />
      </Helmet>

      <BackgroundContainer className="homepage-background">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white/10 dark:bg-gray-900/60 shadow backdrop-blur-sm">
            <div className="container mx-auto p-4 flex justify-between items-center">
              <Logo />
              {currentUser ? (
                <Button variant="ghost" className="dark:text-white dark:hover:bg-white/10" onClick={() => navigate("/host-dashboard")}>
                  Dashboard
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button variant="ghost" className="dark:text-white dark:hover:bg-white/10" onClick={() => navigate("/host-login")}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate("/host-signup")}>
                    Host Sign Up
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* Hero Section */}
          <main className="container mx-auto flex-1 flex flex-col justify-center items-center p-4">
            <div className="text-center mb-4 md:animate-fade-in">
              <h1 className="text-5xl font-bold gradient-heading mb-4">Interactive Science Quiz Platform</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Create and participate in engaging science quizzes for high school students. Perfect for classroom activities or remote learning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
              {[
                {
                  title: "Join as Player",
                  description: "Enter a game code to join a quiz as a player. Compete with others and test your knowledge!",
                  icon: <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
                  button: (
                    <Button onClick={handleJoinClick} className="quiz-btn-primary w-full">
                      <Play className="h-4 w-4 mr-2" /> Join Game
                    </Button>
                  ),
                },
                {
                  title: "Host a Game",
                  description: "Create your own quiz, invite players, and host an interactive learning session.",
                  icon: <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
                  button: (
                    <Button onClick={handleHostClick} className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                      {currentUser ? "Go to Dashboard" : "Host Sign In"}
                    </Button>
                  ),
                },
              ].map(({ title, description, icon, button }, idx) => (
                <div
                  key={idx}
                  className="quiz-card p-8 text-center transform hover:scale-105 transition-all duration-300 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:shadow-xl border border-indigo-100 dark:border-indigo-900/50"
                >
                  <div className="mb-4">
                    <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/50 w-16 h-16 rounded-full flex items-center justify-center">
                      {icon}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
                  {button}
                </div>
              ))}
            </div>
          </main>
        </div>


        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
          <FadeInOnScroll className="p-4 text-white">
            <h2 className="text-3xl font-bold text-center mb-4">About Us</h2>
            <h3 className="text-2xl font-bold text-center mb-4">Our Esteemed Faculty</h3>

            {/* Principal */}
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg mb-4 mx-auto">
              <img src="/principal.webp" alt="Principal" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-semibold text-center">Dr. N. S. Thakare Sir</h3>
            <p className="text-lg text-center text-gray-400 mb-4 max-w-4xl mx-auto">
              "Since 1986 we are developing qualitatively and quantitatively. College has given special attention towards student's educational & cultural development..."
            </p>
            <div className="text-center mb-6">
              <a
                href="https://www.mspkptmanora.ac.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              >
                Visit College Website 🎓
              </a>
            </div>

            {/* Faculty Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[
                {
                  subject: "Mathematics",
                  color: "blue",
                  teachers: [
                    { name: "Prof. Ram Chavhan", img: "math_teacher1.webp" },
                    { name: "Prof. Ashitosh Thakare", img: "math_teacher2.webp" },
                  ],
                },
                {
                  subject: "Biology",
                  color: "green",
                  teachers: [
                    { name: "Prof. S. A. Kale", img: "science_teacher1.webp" },
                    { name: "Prof. Thamevr", img: "science_teacher2.webp" },
                  ],
                },
                {
                  subject: "Chemistry",
                  color: "red",
                  teachers: [
                    { name: "Prof. P. D. Raut", img: "chemistry_teacher1.webp" },
                    { name: "Prof. V. D. Dhole", img: "chemistry_teacher2.webp" },
                  ],
                },
                {
                  subject: "Physics",
                  color: "yellow",
                  teachers: [
                    { name: "Prof. S. P. Deshmukh", img: "physics_teacher1.webp" },
                    { name: "Prof. V. R. Dable", img: "physics_teacher2.webp" },
                  ],
                },
                {
                  subject: "Our Supporter",
                  color: "blue",
                  teachers: [
                    { name: "Prof. Ganjre Sir", img: "english_teacher1.webp" },
                    { name: "Prof. Waghmare Sir", img: "english_teacher2.webp" },
                  ],
                },
              ].map(({ subject, color, teachers }, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-6 shadow-md">
                  <h4 className="text-xl font-bold mb-4">{subject}</h4>
                  <div className="space-y-6">
                    {teachers.map((t, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 border-${color}-400`}>
                          <img
                            src={`/${t.img}`}
                            alt={t.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{t.name}</p>
                          <p className="text-sm text-gray-400">
                            {i === 0 ? "20+ Years Experience" : "15+ Years Experience"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeInOnScroll>

          <CreatorAttribution />

        </Suspense>
      </BackgroundContainer>
    </>
  );
};

export default HomePage;
