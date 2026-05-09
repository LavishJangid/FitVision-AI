import { useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import { fetchChallenges, fetchLeaderboard, fetchSessions, fetchStats } from '../services/api'

function DashboardPage() {
  const [stats, setStats] = useState({
    total_sessions: 0,
    total_reps: 0,
    avg_score: 0,
    total_calories: 0,
    streak_days: 0,
  })
  const [sessions, setSessions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [challenges, setChallenges] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, sessionsData] = await Promise.all([fetchStats(), fetchSessions(8)])
        const [leaderboardData, challengesData] = await Promise.all([fetchLeaderboard(5), fetchChallenges()])
        setStats(statsData)
        setSessions(sessionsData)
        setLeaderboard(leaderboardData)
        setChallenges(challengesData)
      } catch {
        setSessions([])
      }
    }
    load()
  }, [])

  const achievements = useMemo(() => {
    const list = []
    if (stats.total_sessions >= 1) list.push('First session unlocked')
    if (stats.total_reps >= 50) list.push('Rep Warrior: 50+ reps')
    if (stats.avg_score >= 85) list.push('Elite Form: 85+ average score')
    if (stats.streak_days >= 3) list.push('Consistency Streak: 3+ days')
    return list.length ? list : ['Complete one workout to unlock achievements']
  }, [stats])

  const metrics = [
    { label: 'Workouts Completed', value: stats.total_sessions },
    { label: 'Average Form Score', value: `${stats.avg_score}%` },
    { label: 'Total Reps', value: stats.total_reps },
    { label: 'Consistency Streak', value: `${stats.streak_days} days` },
    { label: 'Calories Burned', value: `${stats.total_calories} kcal` },
  ]

  const downloadReport = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('FitVision AI Workout Report', 16, 16)
    doc.setFontSize(12)
    doc.text(`Sessions: ${stats.total_sessions}`, 16, 28)
    doc.text(`Total Reps: ${stats.total_reps}`, 16, 36)
    doc.text(`Avg Score: ${stats.avg_score}%`, 16, 44)
    doc.text(`Calories: ${stats.total_calories} kcal`, 16, 52)
    doc.text(`Streak: ${stats.streak_days} days`, 16, 60)
    doc.text('Recent Sessions:', 16, 74)
    sessions.slice(0, 5).forEach((session, idx) => {
      doc.text(
        `${idx + 1}. ${session.exercise} - ${session.reps} reps - ${session.avg_score}% - ${Math.round(session.duration_seconds / 60)} min`,
        16,
        84 + idx * 8,
      )
    })
    doc.save('fitvision-report.pdf')
  }

  return (
    <section className="page">
      <h2 className="page-title">Performance Dashboard</h2>
      <div className="dashboard-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="card metric-card">
            <p className="muted">{metric.label}</p>
            <h3>{metric.value}</h3>
          </article>
        ))}
      </div>
      <article className="card">
        <h3 className="card-title">Coach Insight</h3>
        <p className="muted">Your strongest zone is consistency. Keep improving average form score above 90.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={downloadReport}>
            Download PDF Report
          </button>
        </div>
      </article>
      <article className="card">
        <h3 className="card-title">Achievements</h3>
        <div className="badge-grid">
          {achievements.map((item) => (
            <span className="badge" key={item}>
              {item}
            </span>
          ))}
        </div>
      </article>
      <article className="card">
        <h3 className="card-title">Recent Sessions</h3>
        {sessions.length === 0 ? (
          <p className="muted">No recorded sessions yet. Start a workout to generate analytics.</p>
        ) : (
          <div className="session-list">
            {sessions.map((session) => (
              <div className="session-item" key={session.id}>
                <strong>{session.exercise.toUpperCase()}</strong>
                <span>{session.reps} reps</span>
                <span>{session.avg_score}% form</span>
                <span>{Math.round(session.duration_seconds / 60)} min</span>
              </div>
            ))}
          </div>
        )}
      </article>
      <article className="card">
        <h3 className="card-title">Challenges</h3>
        <div className="session-list">
          {challenges.map((challenge) => (
            <div className="session-item" key={challenge.title}>
              <strong>{challenge.title}</strong>
              <span>
                {challenge.progress}/{challenge.target} {challenge.unit}
              </span>
            </div>
          ))}
        </div>
      </article>
      <article className="card">
        <h3 className="card-title">Leaderboard</h3>
        <div className="session-list">
          {leaderboard.map((row, idx) => (
            <div className="session-item" key={row.user_id}>
              <strong>#{idx + 1}</strong>
              <span>{row.total_reps} reps</span>
              <span>{row.avg_score}% avg score</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

export default DashboardPage
