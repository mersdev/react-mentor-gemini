import { motion } from "framer-motion";
import { SendIcon } from "lucide-react";

export function ChatInput() {
  return (
    <motion.div
      className="relative flex items-center"
      whileTap={{ scale: 0.995 }}
    >
      <motion.input
        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400 }}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute right-2 p-2 rounded-lg bg-blue-500 text-white"
      >
        <SendIcon />
      </motion.button>
    </motion.div>
  );
}
