from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.workout_service import WorkoutService

router = APIRouter(prefix="/workout", tags=["workout"])
service = WorkoutService()


@router.websocket("/stream")
async def workout_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            payload = await websocket.receive_json()
            frame = payload.get("frame", "")
            exercise = payload.get("exercise", "squat")
            analysis, annotated = service.analyze_frame(frame, exercise)

            await websocket.send_json(
                {
                    "analysis": analysis.model_dump(),
                    "annotated_frame": annotated,
                }
            )
    except WebSocketDisconnect:
        return
