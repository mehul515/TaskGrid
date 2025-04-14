"use client"

import { useState, useEffect } from "react"

const TextWriter = ({ texts, delay = 2000 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(100)

  useEffect(() => {
    const text = texts[currentTextIndex]

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false)
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length)
        setTypingSpeed(100)
      } else {
        const timer = setTimeout(() => {
          setCurrentText(text.substring(0, currentText.length - 1))
        }, typingSpeed / 2)
        return () => clearTimeout(timer)
      }
    } else {
      if (currentText === text) {
        const timer = setTimeout(() => {
          setIsDeleting(true)
        }, delay)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => {
          setCurrentText(text.substring(0, currentText.length + 1))
        }, typingSpeed)
        return () => clearTimeout(timer)
      }
    }
  }, [currentText, currentTextIndex, isDeleting, texts, delay, typingSpeed])

  return (
    <span>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export default TextWriter
