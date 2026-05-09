import { useEffect, useRef, useState } from 'react'
import StatusPanel from '../components/StatusPanel'
import { useWorkoutSocket } from '../hooks/useWorkoutSocket'
import { postSession } from '../services/api'

const exercises = ['squat', 'pushup', 'plank']

function WorkoutPage() {
  const [running, setRunning] = useState(false)
  const [exercise, setExercise] = useState('squat')
  const [analysis, setAnalysis] = useState(null)
  const [annotatedFrame, setAnnotatedFrame] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [calories, setCalories] = useState(0)
  const [sessionSaved, setSessionSaved] = useState('')
  const [bestScore, setBestScore] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const [scoreSamples, setScoreSamples] = useState([])
  const [goalReps, setGoalReps] = useState(20)
  const [voiceCoach, setVoiceCoach] = useState(true)
  const [mirrorMode, setMirrorMode] = useState(true)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  const { socketRef, connected, connect, disconnect, sendFrame } = useWorkoutSocket()

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setAnalysis(data.analysis)
      setAnnotatedFrame(data.annotated_frame)
      const score = Math.round(data.analysis?.accuracy_score || 0)
      setBestScore((prev) => Math.max(prev, score))
      setScoreSamples((prev) => {
        const next = [...prev, score].slice(-200)
        const total = next.reduce((acc, current) => acc + current, 0)
        setAvgScore(Math.round(total / next.length))
        return next
      })
    }
  }, [connected, socketRef])

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (mirrorMode) {
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      ctx.restore()
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }

    const frame = canvas.toDataURL('image/jpeg', 0.75)
    sendFrame(frame, exercise)
  }

  const startWorkout = async () => {
    streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      await videoRef.current.play()
    }

    connect()
    timerRef.current = setInterval(captureFrame, 180)
    setElapsedSeconds(0)
    setCalories(0)
    setSessionSaved('')
    setScoreSamples([])
    setAvgScore(0)
    setBestScore(0)
    setRunning(true)
  }

  const stopWorkout = async () => {
    clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    disconnect()
    setRunning(false)

    if ((analysis?.rep_count ?? 0) > 0 || elapsedSeconds > 10) {
      try {
        await postSession({
          exercise,
          duration_seconds: Math.max(elapsedSeconds, 1),
          reps: analysis?.rep_count ?? 0,
          avg_score: avgScore || analysis?.accuracy_score || 0,
          calories,
          feedback_samples: analysis?.feedback ?? [],
        })
        setSessionSaved('Session saved to dashboard history.')
      } catch {
        setSessionSaved('Could not save session. Backend may be offline.')
      }
    }
  }

  useEffect(() => {
    if (!running) return
    const ticker = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
      setCalories((prev) => prev + (exercise === 'plank' ? 0.08 : 0.12))
    }, 1000)
    return () => clearInterval(ticker)
  }, [running, exercise])

  useEffect(() => () => {
    clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    disconnect()
  }, [disconnect])

  useEffect(() => {
    if (!voiceCoach || !analysis?.feedback?.length) return
    const feedback = analysis.feedback[0]
    if (!('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(feedback)
    utterance.rate = 1
    utterance.pitch = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }, [analysis?.feedback, voiceCoach])

  useEffect(() => {
    setAnnotatedFrame(null)
  }, [mirrorMode])

  return (
    <section className="page">
      <h2 className="page-title">Workout Studio</h2>
      <div className="workout-grid">
        <article className="card webcam-card">
          <div className="controls">
            <select value={exercise} onChange={(e) => setExercise(e.target.value)}>
              {exercises.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {!running ? (
              <button className="btn btn-primary" onClick={startWorkout}>
                Start Workout
              </button>
            ) : (
              <button className="btn btn-danger" onClick={stopWorkout}>
                Stop Workout
              </button>
            )}
            <input
              className="goal-input"
              type="number"
              min={1}
              value={goalReps}
              onChange={(e) => setGoalReps(Number(e.target.value) || 1)}
              title="Rep Goal"
            />
            <button className="btn btn-ghost" onClick={() => setVoiceCoach((prev) => !prev)}>
              Voice Coach: {voiceCoach ? 'ON' : 'OFF'}
            </button>
            <button className="btn btn-ghost" onClick={() => setMirrorMode((prev) => !prev)}>
              Mirror: {mirrorMode ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="micro-metrics">
            <span>Best Score: {bestScore}</span>
            <span>Avg Score: {avgScore || 0}</span>
            <span>
              Goal Progress: {Math.min(100, Math.round(((analysis?.rep_count ?? 0) / goalReps) * 100))}%
            </span>
          </div>
          <div className="video-wrapper">
            <video ref={videoRef} muted playsInline className={mirrorMode ? 'mirrored' : ''} />
            <canvas ref={canvasRef} className="hidden-video" />
          </div>
          {annotatedFrame ? (
            <div className="analysis-preview">
              <p className="muted">AI Skeleton Preview</p>
              <img src={`data:image/jpeg;base64,${annotatedFrame}`} alt="Annotated posture feed" className={mirrorMode ? 'mirrored' : ''} />
            </div>
          ) : null}
          {sessionSaved ? <p className="session-message">{sessionSaved}</p> : null}
        </article>
        <StatusPanel
          analysis={analysis}
          connected={connected}
          activeExercise={exercise}
          elapsedSeconds={elapsedSeconds}
          calories={calories}
        />
      </div>
    </section>
  )
}

export default WorkoutPage
