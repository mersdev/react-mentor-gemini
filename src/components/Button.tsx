import React from "react";
import { motion, type MotionProps } from "framer-motion";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    MotionProps {
  // Add any custom props here
}

export function Button({ children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
