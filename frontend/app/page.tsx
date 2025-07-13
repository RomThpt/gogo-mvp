"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import Link from "next/link"

export default function HomePage() {

  return (
    <div className="min-h-screen text-black relative" style={{
      background: 'radial-gradient(ellipse 250% 180% at 50% 100%, #FFF5F7 0%, #FFE6EC 15%, #FA014D 45%, #FA014D 100%)'
    }}>
      

      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col items-center justify-center space-y-12 z-10 px-4"
        >
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <img src="/LOGO.svg" alt="GOGO Logo" className="w-80 h-40" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="text-center z-10 px-4 mt-16"
        >
          <motion.p
            className="text-xl md:text-2xl mb-8 text-white font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            Bet. Stake. Support. Repeat.
          </motion.p>

          <motion.p
            className="text-lg mb-12 max-w-2xl mx-auto text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            The revolutionary sports betting platform. Place your bets and win big.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8 }}
          >
            <Link href="/betting">
              <div className="relative">
                <div className="absolute inset-0 transform skew-x-2 rounded-lg" style={{ backgroundColor: '#FA014D' }}></div>
                <Button
                  size="lg"
                  className="relative text-white hover:opacity-90 px-12 py-6 text-xl font-bold border-2 transition-all duration-300 shadow-lg"
                  style={{ 
                    backgroundColor: '#FA014D', 
                    borderColor: '#FA014D' 
                  }}
                >
                  Start Betting
                </Button>
              </div>
            </Link>
          </motion.div>
        </motion.div>

      </section>



    </div>
  )
}
