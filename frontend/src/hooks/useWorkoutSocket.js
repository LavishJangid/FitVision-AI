import { useCallback, useEffect, useRef, useState } from 'react'
import { WS_BASE_URL } from '../services/api'

export function useWorkoutSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return
    }
    const socket = new WebSocket(`${WS_BASE_URL}/workout/stream`)
    socket.onopen = () => setConnected(true)
    socket.onclose = () => setConnected(false)
    socket.onerror = () => setConnected(false)
    socketRef.current = socket
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.close()
    socketRef.current = null
    setConnected(false)
  }, [])

  const sendFrame = useCallback((frame, exercise) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify({ frame, exercise }))
  }, [])

  useEffect(() => () => disconnect(), [disconnect])

  return { socketRef, connected, connect, disconnect, sendFrame }
}
