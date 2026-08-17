"use client";
import React from "react";
import { motion } from "framer-motion";

export const Spotlight = ({
  className = "",
  fill = "rgba(255,255,255,1)",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] max-w-[600px] h-[150%] blur-[80px] opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% -20%, ${fill} 0%, transparent 70%)`
        }}
      />
      {/* Light beam */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] max-w-[800px] h-[150%] blur-[50px] opacity-15 pointer-events-none origin-top"
        style={{
          background: `conic-gradient(from 180deg at 50% -10%, transparent 40%, ${fill} 50%, transparent 60%)`
        }}
      />
    </motion.div>
  );
};
