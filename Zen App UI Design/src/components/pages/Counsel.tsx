import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles } from "lucide-react";

interface Message {
  id: number;
  type: "user" | "ai";
  text: string;
  insight?: string;
}

export function Counsel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      text: "I'm here to listen. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [wisdomMode, setWisdomMode] = useState(false);

  const aiResponses = [
    {
      text: "That sounds like a tender place to be. Tell me more about what that feels like.",
      insight: "This echoes something you've felt before…",
    },
    {
      text: "I notice you're holding both hope and uncertainty together. That takes courage.",
      insight: "This aligns with what matters to you…",
    },
    {
      text: "What would it mean to accept this part of yourself?",
    },
  ];

  const wisdomResponses = [
    "The wound is the place where the Light enters you.",
    "You are not a drop in the ocean. You are the entire ocean in a drop.",
    "The quieter you become, the more you can hear.",
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const response = wisdomMode
        ? wisdomResponses[Math.floor(Math.random() * wisdomResponses.length)]
        : aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMessage: Message = {
        id: messages.length + 2,
        type: "ai",
        text: typeof response === "string" ? response : response.text,
        insight: typeof response === "string" ? undefined : response.insight,
      };

      setMessages((prev) => [...prev, aiMessage]);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-20 py-16">
      <div className="max-w-4xl w-full h-[80vh] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h2 className="mb-2">Counsel</h2>
            <p style={{ color: "var(--color-text-light)" }}>
              A space for reflection and understanding
            </p>
          </div>

          <motion.button
            onClick={() => setWisdomMode(!wisdomMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full"
            style={{
              background: wisdomMode
                ? "rgba(212, 201, 224, 0.3)"
                : "rgba(212, 201, 224, 0.1)",
              color: "var(--color-lavender)",
              border: `1px solid ${
                wisdomMode
                  ? "rgba(212, 201, 224, 0.5)"
                  : "rgba(212, 201, 224, 0.2)"
              }`,
            }}
          >
            <Sparkles size={18} strokeWidth={1.5} />
            <span>Wisdom Companion</span>
          </motion.button>
        </motion.div>

        {wisdomMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 p-6 rounded-2xl"
            style={{
              background: "rgba(212, 201, 224, 0.2)",
              border: "1px solid rgba(212, 201, 224, 0.3)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(212, 201, 224, 0.3)",
                }}
              >
                <span className="text-2xl">🕊️</span>
              </div>
              <div>
                <h3
                  className="text-sm mb-1"
                  style={{ color: "var(--color-lavender)" }}
                >
                  Ancient Voice
                </h3>
                <p className="text-sm serif" style={{ color: "var(--color-text-light)" }}>
                  Speaking from timeless wisdom
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="flex-1 overflow-y-auto mb-6 p-8 rounded-3xl"
          style={{
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(168, 201, 195, 0.2)",
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className={`mb-8 ${
                  message.type === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block max-w-2xl p-6 rounded-2xl ${
                    message.type === "ai" && wisdomMode ? "serif" : ""
                  }`}
                  style={{
                    background:
                      message.type === "user"
                        ? "rgba(168, 201, 195, 0.2)"
                        : "rgba(255, 255, 255, 0.6)",
                    border:
                      message.type === "user"
                        ? "1px solid rgba(168, 201, 195, 0.3)"
                        : "1px solid rgba(168, 201, 195, 0.15)",
                  }}
                >
                  <p className="text-lg leading-relaxed">{message.text}</p>
                </div>

                {message.insight && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-3 px-4 py-2 inline-block rounded-full text-sm"
                    style={{
                      background: "rgba(212, 201, 224, 0.2)",
                      color: "var(--color-lavender)",
                      border: "1px solid rgba(212, 201, 224, 0.3)",
                    }}
                  >
                    ✨ {message.insight}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Share what's on your heart..."
            className="flex-1 px-6 py-4 rounded-full text-lg bg-transparent outline-none"
            style={{
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(168, 201, 195, 0.2)",
            }}
          />
          <motion.button
            onClick={handleSend}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="px-8 py-4 rounded-full flex items-center gap-2"
            style={{
              background: "rgba(168, 201, 195, 0.3)",
              color: "var(--color-teal)",
              border: "1px solid rgba(168, 201, 195, 0.4)",
            }}
          >
            <Send size={20} strokeWidth={1.5} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
