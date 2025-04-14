"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

const TestimonialCard = ({ quote, author, role, company, variant }) => {
  return (
    <motion.div
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-teal-500/50 transition-all h-full flex flex-col group relative overflow-hidden"
      variants={variant}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-500/10 to-transparent -mr-16 -mt-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="mb-4 text-teal-500">
        <Quote className="h-8 w-8 opacity-50" />
      </div>
      <p className="text-gray-300 mb-6 flex-grow relative z-10">{quote}</p>
      <div className="flex items-center relative z-10">
        <div className="mr-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
            {author
              .split(" ")
              .map((name) => name[0])
              .join("")}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white">{author}</h4>
          <p className="text-gray-400 text-sm">
            {role}, {company}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 w-0 group-hover:w-full transition-all duration-300"></div>
    </motion.div>
  )
}

export default TestimonialCard
