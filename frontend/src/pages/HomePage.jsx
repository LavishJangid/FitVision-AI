import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <section className="page">
      <motion.div
        className="hero-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="pill">AI Fitness Coach</p>
        <h1>Real-time posture correction with webcam intelligence</h1>
        <p className="hero-text">
          FitVision AI analyzes form, counts reps, and gives live coaching for squats, push-ups, and
          planks with low-latency computer vision.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/workout">
            Start Workout
          </Link>
          <Link className="btn btn-ghost" to="/auth">
            Login / Register
          </Link>
          <Link className="btn btn-ghost" to="/dashboard">
            View Dashboard
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default HomePage
