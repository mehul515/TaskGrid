"use client"

import { motion } from "framer-motion"

const FeatureCard = ({ icon, title, description, variant }) => {
  return (
    <motion.div
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-teal-500/50 transition-all group relative overflow-hidden"
      variants={variant}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-teal-500/10 to-transparent -mr-10 -mt-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="bg-gray-700/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 w-0 group-hover:w-full transition-all duration-300"></div>
    </motion.div>
  )
}

export default FeatureCard
