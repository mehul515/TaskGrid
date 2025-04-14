"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle,
  Users,
  Calendar,
  Clock,
  BarChart3,
  Layers,
  Zap,
  ChevronDown,
  ChevronUp,
  Globe,
  Shield,
  Sparkles,
  Star,
} from "lucide-react"
import TextWriter from "@/components/landingPage/text-writer"
import FeatureCard from "@/components/landingPage/feature-card"
import TestimonialCard from "@/components/landingPage/testimonial-card"

export default function Home() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }
    checkSession()

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [router])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null)
    } else {
      setOpenFaq(index)
    }
  }

  const faqItems = [
    {
      question: "How does TaskGrid help with team collaboration?",
      answer:
        "TaskGrid enables seamless team collaboration by allowing you to create organizations, form dedicated teams for each project, and assign specific roles like Developer, Manager, or Tester. Team members can communicate directly within tasks, share files, and track progress in real-time, ensuring everyone stays aligned and informed.",
    },
    {
      question: "Can I customize the Kanban boards for my workflow?",
      answer:
        "TaskGrid's Kanban boards are fully customizable to match your team's unique workflow. You can create custom columns beyond the standard To Do, In Progress, and Done. Add, remove, or rename columns, set work-in-progress limits, and even create multiple board views for different aspects of your project.",
    },
    {
      question: "How does the time tracking feature work?",
      answer:
        "TaskGrid's time tracking is simple yet powerful. Start and stop timers directly from tasks, or manually log time entries. Track time spent by team members, projects, or specific tasks. Generate detailed reports for billing clients accurately or analyzing team productivity patterns over time.",
    },
    {
      question: "Is TaskGrid suitable for client work?",
      answer:
        "Yes! TaskGrid is designed with client work in mind. You can add clients to your organization with limited access, allowing them to view project progress without accessing sensitive information. Create client-specific project boards, share reports, and maintain professional communication all within the platform.",
    },
    {
      question: "What kind of reporting and analytics does TaskGrid offer?",
      answer:
        "TaskGrid provides comprehensive reporting tools including burndown charts, velocity tracking, and time reports. Analyze team performance, track project progress, identify bottlenecks, and forecast completion dates. Custom dashboards give you at-a-glance insights into the metrics that matter most to your team.",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-md flex items-center justify-center">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TaskGrid</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Navbar */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-gray-900/90 backdrop-blur-md py-3 shadow-lg" : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-md flex items-center justify-center">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TaskGrid</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-300 hover:text-teal-400 transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-teal-400 transition-colors">
              About
            </Link>
            <Link href="#kanban" className="text-gray-300 hover:text-teal-400 transition-colors">
              Kanban
            </Link>
            <Link href="#testimonials" className="text-gray-300 hover:text-teal-400 transition-colors">
              Testimonials
            </Link>
            <Link href="#faq" className="text-gray-300 hover:text-teal-400 transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="w-24 text-center text-gray-300 hover:text-white transition-colors font-medium px-4 py-2 rounded-md duration-300 
            border border-teal-500/50 hover:border-teal-500/90 hover:bg-teal-500/10
            focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="w-24 text-center relative group overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-md transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
            >
              <span className="relative z-10">Sign Up</span>
              <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 to-gray-950 z-0"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-teal-500/10 via-gray-900/0 to-gray-900/0 z-0"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat opacity-5 z-0"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-block mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                Streamline your workflow like never before
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 leading-tight">
              Streamline Your Team&apos;s Workflow with TaskGrid
            </h1>
            <div className="relative mb-8">
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                <TextWriter
                  texts={[
                    "Collaborate seamlessly with your team.",
                    "Manage projects with intuitive Kanban boards.",
                    "Track time and meet deadlines effortlessly.",
                  ]}
                  delay={3000}
                />
              </p>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link
                href="/auth/signup"
                className="relative group overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-2.5 rounded-md text-base font-medium transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] flex items-center justify-center gap-2"
              >
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="h-4 w-4 relative z-10" />
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
              <Link
                href="#about"
                className="text-white px-5 py-2.5 rounded-md text-base font-medium transition-all duration-300 bg-transparent border border-teal-500/30 hover:border-teal-500/70 hover:bg-teal-500/10 flex items-center justify-center gap-2"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 relative z-10 max-w-7xl mx-auto px-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg blur opacity-30"></div>
            <div className="relative bg-gray-900 rounded-lg border border-gray-800 shadow-2xl overflow-hidden">
              <Image
                src="/placeholder.svg?height=600&width=1200"
                alt="TaskGrid Dashboard"
                width={1200}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.1),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">About TaskGrid</h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              TaskGrid is a comprehensive team collaboration and task management platform designed specifically for
              freelancers, startups, and small agencies who need powerful tools without the complexity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-white">Our Mission</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                We believe that great work happens when teams have the right tools to collaborate effectively. TaskGrid
                was born from our own frustrations with existing project management solutions that were either too
                complex or too simplistic for real-world team collaboration.
              </p>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Our mission is to empower teams of all sizes to work together seamlessly, meet deadlines consistently,
                and deliver exceptional results for their clients and stakeholders.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-teal-500/20 p-1.5 rounded-full">
                    <CheckCircle className="h-4 w-4 text-teal-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Built for real teams</h4>
                    <p className="text-gray-400">Designed based on feedback from hundreds of teams like yours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-teal-500/20 p-1.5 rounded-full">
                    <CheckCircle className="h-4 w-4 text-teal-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Powerful yet intuitive</h4>
                    <p className="text-gray-400">Advanced features without the steep learning curve</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-teal-500/20 p-1.5 rounded-full">
                    <CheckCircle className="h-4 w-4 text-teal-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Constantly evolving</h4>
                    <p className="text-gray-400">Regular updates based on user feedback and industry best practices</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg blur opacity-20"></div>
              <div className="relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-700/50 p-5 rounded-lg text-center">
                    <div className="bg-teal-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-teal-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1">10,000+</h4>
                    <p className="text-gray-400">Active Users</p>
                  </div>
                  <div className="bg-gray-700/50 p-5 rounded-lg text-center">
                    <div className="bg-cyan-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layers className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1">25,000+</h4>
                    <p className="text-gray-400">Projects Created</p>
                  </div>
                  <div className="bg-gray-700/50 p-5 rounded-lg text-center">
                    <div className="bg-teal-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-6 w-6 text-teal-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1">50+</h4>
                    <p className="text-gray-400">Countries</p>
                  </div>
                  <div className="bg-gray-700/50 p-5 rounded-lg text-center">
                    <div className="bg-cyan-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1">4.8/5</h4>
                    <p className="text-gray-400">Average Rating</p>
                  </div>
                </div>
                <div className="mt-6 bg-gray-700/50 p-5 rounded-lg">
                  <h4 className="font-medium text-white mb-2 flex items-center">
                    <Shield className="h-4 w-4 text-teal-400 mr-2" /> Enterprise-Grade Security
                  </h4>
                  <p className="text-gray-400 text-sm">
                    TaskGrid uses industry-leading security practices to ensure your data is always protected. With SOC
                    2 compliance, regular security audits, and end-to-end encryption, you can trust that your team&apos;s
                    work is secure.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-950 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.1),transparent_70%)]"></div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Everything you need to manage projects effectively
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              TaskGrid combines powerful project management features with an intuitive interface to help teams
              collaborate seamlessly.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <FeatureCard
              icon={<Users className="h-6 w-6 text-teal-400" />}
              title="Team Collaboration"
              description="Create organizations, form dedicated teams for each project, and manage roles efficiently."
              variant={fadeInUp}
            />
            <FeatureCard
              icon={<Layers className="h-6 w-6 text-teal-400" />}
              title="Kanban Boards"
              description="Organize tasks across customizable stages like To Do, In Progress, and Done with drag-and-drop simplicity."
              variant={fadeInUp}
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6 text-teal-400" />}
              title="Task Management"
              description="Set due dates, priority levels, add tags, comments, and file attachments to keep everything organized."
              variant={fadeInUp}
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6 text-teal-400" />}
              title="Time Tracking"
              description="Track time spent on tasks to improve productivity and provide accurate client billing."
              variant={fadeInUp}
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-teal-400" />}
              title="Dashboard Analytics"
              description="Get a comprehensive overview of upcoming deadlines, active tasks, and project progress."
              variant={fadeInUp}
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-teal-400" />}
              title="Role-Based Access"
              description="Control who can view and edit projects with customizable permission levels for team members."
              variant={fadeInUp}
            />
          </motion.div>
        </div>
      </section>

      {/* Kanban Board Highlight Section */}
      <section id="kanban" className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(20,184,166,0.1),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1"
            >
              <div className="inline-block mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Visual Project Management
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Intuitive Kanban Boards</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                TaskGrid&apos;s Kanban boards provide a visual overview of your project&apos;s progress. Easily move tasks between
                columns as they progress from idea to completion.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-500/20 p-2 rounded-md mt-1">
                    <Layers className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">Customizable Workflows</h4>
                    <p className="text-gray-400">
                      Create custom columns to match your team&apos;s unique process. Add, remove, or rename columns as your
                      workflow evolves.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-teal-500/20 p-2 rounded-md mt-1">
                    <Zap className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">Drag-and-Drop Simplicity</h4>
                    <p className="text-gray-400">
                      Move tasks between stages with a simple drag and drop. Reprioritize work by reordering cards
                      within columns.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-teal-500/20 p-2 rounded-md mt-1">
                    <BarChart3 className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">Visual Progress Tracking</h4>
                    <p className="text-gray-400">
                      See your project&apos;s status at a glance. Identify bottlenecks and balance workloads for optimal team
                      performance.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/auth/signup"
                className="relative group overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-2.5 rounded-md text-base font-medium transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] inline-flex items-center gap-2"
              >
                <span className="relative z-10">Try Kanban Boards</span>
                <ArrowRight className="h-4 w-4 relative z-10" />
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
            </motion.div>

            <motion.div
              className="relative order-1 md:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg blur opacity-30"></div>
              <div className="relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-2xl">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="TaskGrid Kanban Board"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-teal-500/10 backdrop-blur-sm border border-teal-500/20 rounded-lg p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-500/20 p-2 rounded-full">
                    <Zap className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Boost productivity by 35%</p>
                    <p className="text-gray-400 text-sm">with visual task management</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-950 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.1),transparent_70%)]"></div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">How TaskGrid works</h2>
            <p className="text-xl text-gray-400">A simple yet powerful workflow designed for teams of all sizes</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Create your organization",
                description: "Set up your workspace and invite team members to join your organization.",
              },
              {
                step: "02",
                title: "Build project boards",
                description: "Create Kanban boards for each project with customized columns and workflows.",
              },
              {
                step: "03",
                title: "Collaborate and track",
                description: "Assign tasks, track progress, and communicate with your team in one place.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <div className="bg-gray-800 rounded-lg p-8 h-full border border-gray-700 hover:border-teal-500/50 transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/20 to-transparent -mr-12 -mt-12 rounded-full"></div>
                  <div className="text-5xl font-bold text-teal-500/20 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-3 text-white relative z-10">{item.title}</h3>
                  <p className="text-gray-400 relative z-10">{item.description}</p>
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 w-0 group-hover:w-full transition-all duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-900 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.1),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">What our customers say</h2>
            <p className="text-xl text-gray-400">
              Teams of all sizes trust TaskGrid to manage their projects efficiently
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <TestimonialCard
              quote="TaskGrid has transformed how our design team collaborates. The Kanban boards are intuitive and the time tracking feature is a game-changer for client billing."
              author="Sarah Johnson"
              role="Design Director"
              company="Artistry Studios"
              variant={fadeInUp}
            />
            <TestimonialCard
              quote="We've tried numerous project management tools, but TaskGrid stands out with its perfect balance of powerful features and ease of use. Our productivity has increased by 35%."
              author="Michael Chen"
              role="CTO"
              company="TechNova"
              variant={fadeInUp}
            />
            <TestimonialCard
              quote="The role-based access control is exactly what we needed. Now our clients can view progress without accessing sensitive information. Highly recommended!"
              author="Emma Rodriguez"
              role="Project Manager"
              company="Webflow Agency"
              variant={fadeInUp}
            />
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-950 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.1),transparent_70%)]"></div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-400">Find answers to common questions about TaskGrid</p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                className="mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className={`w-full text-left p-5 rounded-lg flex justify-between items-center transition-all ${openFaq === index
                    ? "bg-gray-800 border-teal-500 shadow-md shadow-teal-500/5"
                    : "bg-gray-800/50 hover:bg-gray-800 border-gray-700"
                    } border`}
                >
                  <span className="font-medium text-white">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-teal-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="bg-gray-800/50 border border-t-0 border-gray-700 rounded-b-lg p-5 text-gray-300 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.15),transparent_70%)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            className="max-w-4xl mx-auto text-center bg-gray-900/50 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 z-0"></div>
            <div className="relative z-10">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Limited Time Offer
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Ready to transform how your team works?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of teams that use TaskGrid to collaborate effectively and deliver projects on time. Sign
                up today and get 30% off your first 3 months!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="relative group overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-md text-lg font-medium transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
                >
                  <span className="relative z-10">Get Started Free</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
                <Link
                  href="#features"
                  className="text-white px-6 py-3 rounded-md text-lg font-medium transition-all duration-300 bg-transparent border border-teal-500/30 hover:border-teal-500/70 hover:bg-teal-500/10"
                >
                  Learn More
                </Link>
              </div>
              <p className="mt-6 text-gray-400">Free 14-day trial • No credit card required • Cancel anytime</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-md flex items-center justify-center">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">TaskGrid</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-xs">
                TaskGrid helps teams collaborate effectively with intuitive project management tools.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#kanban" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Kanban
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-gray-400 hover:text-teal-400 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#about" className="text-gray-400 hover:text-teal-400 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">© {new Date().getFullYear()} TaskGrid. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}