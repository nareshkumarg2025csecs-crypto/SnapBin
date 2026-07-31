import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-md flex items-center justify-center transition-colors"
      style={{
        border: "1px solid var(--border)",
        color: "var(--text-muted)",
        backgroundColor: "transparent",
      }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </motion.button>
  );
}
