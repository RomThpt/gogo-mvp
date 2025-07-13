"use client"

import { motion } from "framer-motion"

interface GogoLogoProps {
  className?: string
}

export default function GogoLogo({ className = "w-64 h-32" }: GogoLogoProps) {
  return (
    <motion.div
      className={`${className} flex items-center justify-center`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <svg viewBox="0 0 280 100" className="w-full h-full" fill="currentColor">
        {/* GOGO Logo with circular element */}
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          initial={{ pathLength: 0, rotate: 0 }}
          animate={{ pathLength: 1, rotate: 360 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Inner circular design */}
        <motion.path
          d="M25 50 A25 25 0 0 1 75 50 A15 15 0 0 0 45 50 Z"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        />

        {/* GOGO Text */}
        <motion.text
          x="100"
          y="65"
          fontSize="48"
          fontWeight="900"
          fontFamily="Inter, sans-serif"
          letterSpacing="2px"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          GOGO
        </motion.text>

        {/* Decorative dots */}
        <motion.circle
          cx="260"
          cy="30"
          r="4"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 2, duration: 0.6 }}
        />
        <motion.circle
          cx="270"
          cy="45"
          r="3"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 2.2, duration: 0.6 }}
        />
        <motion.circle
          cx="265"
          cy="60"
          r="2"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 2.4, duration: 0.6 }}
        />
      </svg>
    </motion.div>
  )
}
