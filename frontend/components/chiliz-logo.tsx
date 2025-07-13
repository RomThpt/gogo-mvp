"use client"

import { motion } from "framer-motion"

interface ChilizLogoProps {
  className?: string
}

export default function ChilizLogo({ className = "w-48 h-24" }: ChilizLogoProps) {
  return (
    <motion.div
      className={`${className} flex items-center justify-center`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <svg viewBox="0 0 200 80" className="w-full h-full" fill="currentColor">
        {/* Chiliz Logo Recreation */}
        <motion.path
          d="M20 25 C20 15, 30 10, 40 15 L50 20 C55 22, 55 28, 50 30 L40 35 C30 40, 20 35, 20 25 Z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />

        {/* Text "chiliz" */}
        <motion.text
          x="70"
          y="35"
          fontSize="24"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          chiliz
        </motion.text>

        {/* Decorative elements */}
        <motion.circle
          cx="35"
          cy="25"
          r="3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5, type: "spring" }}
        />
      </svg>
    </motion.div>
  )
}
