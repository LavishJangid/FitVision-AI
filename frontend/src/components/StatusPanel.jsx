function StatusPanel({ analysis, connected, activeExercise, elapsedSeconds = 0, calories = 0 }) {
  const feedback = analysis?.feedback ?? ['Waiting for camera...']
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <section className="card">
      <h3 className="card-title">Real-Time Status</h3>
      <div className="status-row">
        <span>Connection</span>
        <span className={connected ? 'good' : 'bad'}>{connected ? 'Live' : 'Offline'}</span>
      </div>
      <div className="status-row">
        <span>Exercise</span>
        <span>{activeExercise}</span>
      </div>
      <div className="status-row">
        <span>Stage</span>
        <span>{analysis?.stage ?? 'idle'}</span>
      </div>
      <div className="status-row">
        <span>Reps</span>
        <span>{analysis?.rep_count ?? 0}</span>
      </div>
      <div className="status-row">
        <span>Form Score</span>
        <span className={(analysis?.accuracy_score ?? 0) >= 80 ? 'good' : 'bad'}>
          {Math.round(analysis?.accuracy_score ?? 0)}
        </span>
      </div>
      <div className="status-row">
        <span>Duration</span>
        <span>{duration}</span>
      </div>
      <div className="status-row">
        <span>Calories</span>
        <span>{calories.toFixed(1)} kcal</span>
      </div>
      <div className="feedback-list">
        {feedback.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  )
}

export default StatusPanel
