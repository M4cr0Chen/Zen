import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ParticleBackground } from "./components/ParticleBackground";
import { Navigation } from "./components/Navigation";
import { Home } from "./components/pages/Home";
import { Journal } from "./components/pages/Journal";
import { DigitalSelf } from "./components/pages/DigitalSelf";
import { Counsel } from "./components/pages/Counsel";
import { Meditation } from "./components/pages/Meditation";
import { Profile } from "./components/pages/Profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={setCurrentPage} />;
      case "journal":
        return <Journal onNavigate={setCurrentPage} />;
      case "digital-self":
        return <DigitalSelf />;
      case "counsel":
        return <Counsel />;
      case "meditation":
        return <Meditation />;
      case "profile":
        return <Profile />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "linear-gradient(135deg, var(--color-bg-start) 0%, var(--color-bg-mid) 50%, var(--color-bg-end) 100%)",
      }}
    >
      <ParticleBackground />
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <div className="ml-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
