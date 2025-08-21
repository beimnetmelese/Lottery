import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Player = { name: string; number: string; id: number };
type Winner = Player & { date: string };

export default function LotteryApp() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [winnersHistory, setWinnersHistory] = useState<Winner[]>([]);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState<boolean>(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPlayers = JSON.parse(
      localStorage.getItem("lotteryPlayers") || "[]"
    );
    const savedWinners = JSON.parse(
      localStorage.getItem("lotteryWinners") || "[]"
    );
    setPlayers(savedPlayers);
    setWinnersHistory(savedWinners);
  }, []);

  // Save to localStorage whenever players or winners change
  useEffect(() => {
    localStorage.setItem("lotteryPlayers", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("lotteryWinners", JSON.stringify(winnersHistory));
  }, [winnersHistory]);

  const handleRegister = () => {
    if (!name.trim() || !number.trim()) return;
    const newPlayer = {
      name: name.trim(),
      number: number.trim(),
      id: Date.now(),
    };
    setPlayers([...players, newPlayer]);
    setName("");
    setNumber("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRegister();
  };

  const handleDraw = () => {
    if (players.length === 0) return;
    setIsDrawing(true);
    setWinner(null);
    setShowConfetti(false);
    setShowWinnerPopup(false);

    const spinDuration = 4000; // Increased duration for more suspense
    const startTime = Date.now();

    const spinInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= spinDuration) {
        clearInterval(spinInterval);
        const randomIndex = Math.floor(Math.random() * players.length);
        const newWinner = players[randomIndex];
        setWinner(newWinner);
        setIsDrawing(false);
        setShowConfetti(true);
        setShowWinnerPopup(true);

        // ✅ safe state updates
        setWinnersHistory((prev) => [
          { ...newWinner, date: new Date().toLocaleString() },
          ...prev,
        ]);
        setPlayers((prev) => prev.filter((p) => p.id !== newWinner.id));

        setTimeout(() => setShowConfetti(false), 7000);
      }
    }, 100);
  };

  const closeWinnerPopup = () => {
    setShowWinnerPopup(false);
  };

  const clearHistory = () => {
    setWinnersHistory([]);
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  const clearAllPlayers = () => {
    setPlayers([]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            initial={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
            }}
            animate={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Confetti animation */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-60">
            {[...Array(200)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-4 opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  background: [
                    `#ff0000`,
                    `#00ff00`,
                    `#0000ff`,
                    `#ffff00`,
                    `#ff00ff`,
                    `#00ffff`,
                  ][Math.floor(Math.random() * 6)],
                }}
                initial={{ y: -100, rotate: 0 }}
                animate={{ y: "100vh", rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.h1
        className="text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-400 py-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        🎉 Ultimate Lottery Draw 🎉
      </motion.h1>

      {/* Register Player Card */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="mr-2">👤</span> Register Player
        </h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full p-3 mb-3 rounded-xl bg-white/90 text-black placeholder-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
        />
        <input
          type="text"
          placeholder="Lucky Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full p-3 mb-4 rounded-xl bg-white/90 text-black placeholder-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
        />
        <motion.button
          onClick={handleRegister}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 p-3 rounded-xl font-semibold shadow-lg transition-all"
        >
          Register Player
        </motion.button>
      </motion.div>

      {/* Players List Card */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold flex items-center">
            <span className="mr-2">📋</span> Players ({players.length})
          </h2>
          {players.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAllPlayers}
              className="text-sm bg-red-500/30 hover:bg-red-500/50 px-3 py-1 rounded-lg transition-colors"
            >
              Clear All
            </motion.button>
          )}
        </div>

        {players.length === 0 ? (
          <p className="text-center py-4 text-white/70">
            No players registered yet...
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto pr-2">
            {players.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex justify-between items-center bg-white/10 p-3 rounded-lg mb-2"
              >
                <div>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-yellow-300 ml-2">({p.number})</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removePlayer(p.id)}
                  className="text-red-400 hover:text-red-300 text-lg"
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Draw Button */}
      <motion.button
        onClick={handleDraw}
        disabled={players.length === 0 || isDrawing}
        whileHover={{ scale: players.length === 0 || isDrawing ? 1 : 1.05 }}
        whileTap={{ scale: players.length === 0 || isDrawing ? 1 : 0.95 }}
        className={`mt-4 mb-8 z-[50] px-8 py-4 rounded-full font-bold text-xl shadow-2xl ${
          players.length === 0 || isDrawing
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        }`}
      >
        {isDrawing ? "Drawing..." : "🎲 Draw Winner"}
      </motion.button>

      {/* Drawing Animation - Big Spinning Wheel */}
      <AnimatePresence>
        {isDrawing && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-black/90 z-50 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: 0 }}
              animate={{ scale: 1, rotate: 1440 }} // Multiple rotations for more drama
              transition={{ duration: 4, ease: "easeOut" }}
              className="text-9xl md:text-[10rem] mb-8"
            >
              🎡
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.8,
              }}
              className="text-3xl font-bold text-white text-center"
            >
              <p>Drawing the winner...</p>
              <p className="text-xl mt-2">Good luck everyone! 🍀</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Announcement Popup */}
      <AnimatePresence>
        {showWinnerPopup && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/90 z-50 p-4"
            onClick={closeWinnerPopup}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="relative w-full max-w-2xl bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-300 p-1 rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Golden border effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-3xl opacity-80 blur-md -z-10"></div>

              {/* Main golden background */}
              <div className="bg-gradient-to-b from-yellow-500 via-yellow-400 to-yellow-300 rounded-3xl p-8 text-center relative overflow-hidden border-2 border-yellow-200">
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/30 to-transparent animate-pulse"></div>

                {/* Close button */}
                <button
                  onClick={closeWinnerPopup}
                  className="absolute top-5 right-5 text-yellow-800 hover:text-yellow-900 text-2xl bg-yellow-200/80 hover:bg-yellow-200 p-2 rounded-full transition-all duration-200 z-10 shadow-md"
                >
                  ✕
                </button>

                {/* Trophy icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                  className="text-7xl mb-6 drop-shadow-lg"
                >
                  🏆
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold mb-4 text-white drop-shadow-md"
                >
                  CONGRATULATIONS!
                </motion.h2>

                {/* Winner details */}
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                  className="my-8"
                >
                  <div className="text-5xl font-extrabold text-white p-2 drop-shadow-md">
                    {winner.name}
                  </div>
                  <p className="text-2xl font-semibold mt-6 text-white">
                    Lucky Number:{" "}
                    <span className="text-3xl bg-yellow-600 text-white px-4 py-2 rounded-full font-bold shadow-inner">
                      {winner.number}
                    </span>
                  </p>
                </motion.div>

                {/* Celebration text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xl font-medium text-white mb-8"
                >
                  You are the winner! 🎊
                </motion.div>

                {/* Celebrate button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 25px rgba(139, 69, 19, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowConfetti(true);
                  }}
                  className="bg-yellow-800 z-[55] hover:bg-yellow-900 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 border-2 border-yellow-700"
                >
                  Celebrate! 🎉
                </motion.button>

                {/* Decorative elements */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="flex justify-center space-x-4 mt-6 text-3xl text-yellow-800"
                >
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0 }}
                  >
                    🎊
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                  >
                    🎉
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
                  >
                    🥳
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winners History */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold flex items-center">
            <span className="mr-2">🏆</span> Past Winners
          </h2>
          {winnersHistory.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearHistory}
              className="text-sm bg-red-500/30 hover:bg-red-500/50 px-3 py-1 rounded-lg transition-colors"
            >
              Clear History
            </motion.button>
          )}
        </div>

        {winnersHistory.length === 0 ? (
          <p className="text-center py-4 text-white/70">
            No winners yet. Draw the first winner!
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto pr-2">
            {winnersHistory.map((winner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 p-3 rounded-lg mb-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{winner.name}</span>
                    <span className="text-yellow-300 ml-2">
                      ({winner.number})
                    </span>
                  </div>
                  <span className="text-sm text-white/70">{winner.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="mt-8 text-white/60 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Made with ❤️ for your lottery draws
      </motion.footer>

      <style>{`
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
        }
        
        * {
          box-sizing: border-box;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
