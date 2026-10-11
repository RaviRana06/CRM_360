from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket client connected. Active clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WebSocket client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws/geo")
async def websocket_geo_tracking(websocket: WebSocket):
    """Real-time WebSocket endpoint for live field location broadcasting."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast location update to all connected dashboard subscribers
            await manager.broadcast({
                "type": "LOCATION_UPDATE",
                "employee_name": data.get("employee_name", "Field Rep"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
                "address": data.get("address", "Check-in Location"),
                "timestamp": data.get("timestamp")
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        manager.disconnect(websocket)
