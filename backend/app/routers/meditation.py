from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import google.generativeai as genai
from app.config import get_settings
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import json

router = APIRouter()
settings = get_settings()
genai.configure(api_key=settings.google_api_key)

# Meditation session stages
MEDITATION_STAGES = [
    {
        "id": "welcome",
        "name": "Welcome",
        "duration": 30,  # seconds
        "icon": "heart",
        "description": "Setting intentions",
        "prompt": """Generate a warm, brief welcome (2-3 sentences) for a meditation session.
        Welcome them, acknowledge they're taking time for themselves, and invite them to find a comfortable position.
        Keep it calming and gentle."""
    },
    {
        "id": "breathing",
        "name": "Breathing",
        "duration": 120,
        "icon": "wind",
        "description": "Deep breathing exercises",
        "prompt": """Guide a 2-minute breathing exercise. Include:
        - Box breathing (inhale 4 counts, hold 4, exhale 4, hold 4)
        - At least 3 full cycles
        - Gentle reminders to release tension
        - Use "..." to indicate pauses
        Keep instructions clear and pacing slow."""
    },
    {
        "id": "bodyscan",
        "name": "Body Scan",
        "duration": 90,
        "icon": "user",
        "description": "Release physical tension",
        "prompt": """Guide a brief body scan (1.5 minutes). Cover:
        - Start at the top of the head
        - Move down through face, shoulders, arms, chest, belly, legs, feet
        - Invite them to notice and release tension
        - Keep it flowing and gentle
        Use "..." for pauses."""
    },
    {
        "id": "visualization",
        "name": "Visualization",
        "duration": 90,
        "icon": "eye",
        "description": "Peaceful imagery",
        "prompt": """Guide a brief peaceful visualization (1.5 minutes).
        - Describe a calming natural scene (forest, beach, mountain meadow, etc.)
        - Engage multiple senses (what they see, hear, feel, smell)
        - Help them feel safe and at peace
        - Use rich but simple imagery
        Use "..." for pauses."""
    },
    {
        "id": "closing",
        "name": "Closing",
        "duration": 30,
        "icon": "sun",
        "description": "Gentle return",
        "prompt": """Gently close the meditation (30 seconds).
        - Slowly bring awareness back to the room
        - Invite gentle movement (fingers, toes)
        - Express gratitude for their practice
        - Leave them with a positive intention
        Keep it brief and warm."""
    }
]


class MeditationStage(BaseModel):
    id: str
    name: str
    duration: int
    icon: str
    description: str


class MeditationSession(BaseModel):
    stages: List[MeditationStage]
    total_duration: int


@router.get("/stages", response_model=MeditationSession)
async def get_meditation_stages():
    """Get all meditation stages for the UI"""
    stages = [
        MeditationStage(
            id=s["id"],
            name=s["name"],
            duration=s["duration"],
            icon=s["icon"],
            description=s["description"]
        )
        for s in MEDITATION_STAGES
    ]
    total = sum(s["duration"] for s in MEDITATION_STAGES)
    return MeditationSession(stages=stages, total_duration=total)


@router.get("/stage/{stage_id}/content")
async def get_stage_content(stage_id: str):
    """Generate content for a specific meditation stage"""
    stage = next((s for s in MEDITATION_STAGES if s["id"] == stage_id), None)
    if not stage:
        return {"error": "Stage not found"}

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')

        system_prompt = f"""You are a calm, soothing meditation guide.
        Speak slowly and gently. Use calming, peaceful language.
        Keep your voice soft and reassuring.

        {stage['prompt']}"""

        response = model.generate_content(
            system_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=500,
            )
        )

        return {
            "stage_id": stage_id,
            "stage_name": stage["name"],
            "content": response.text,
            "duration": stage["duration"]
        }
    except Exception as e:
        print(f"[MEDITATION] Error generating content: {str(e)}")
        return {
            "stage_id": stage_id,
            "stage_name": stage["name"],
            "content": get_fallback_content(stage_id),
            "duration": stage["duration"]
        }


def get_fallback_content(stage_id: str) -> str:
    """Fallback content if AI generation fails"""
    fallbacks = {
        "welcome": """Welcome to your meditation session. Take a moment to find a comfortable position.
        Close your eyes if that feels right, and let your shoulders drop away from your ears.
        You're exactly where you need to be right now.""",

        "breathing": """Let's begin with some deep breathing...

        Breathe in slowly... 2... 3... 4...
        Hold gently... 2... 3... 4...
        Exhale slowly... 2... 3... 4...
        Hold empty... 2... 3... 4...

        Again, breathe in... letting your belly expand...
        Hold... feeling calm and centered...
        Breathe out... releasing any tension...
        Hold... at peace...

        One more time... deep breath in...
        Hold...
        And release completely...
        Rest here for a moment.""",

        "bodyscan": """Bring your attention to the top of your head...
        Notice any sensations there... and let them soften...

        Moving down to your face... relax your forehead... your eyes... your jaw...
        Let your shoulders drop... releasing any tension you're holding...

        Feel your arms grow heavy and relaxed... your hands... your fingers...

        Notice your chest rising and falling... your belly soft...

        Let relaxation flow down through your hips... your legs...
        All the way down to your feet... your toes...

        Your whole body is supported... relaxed... at ease.""",

        "visualization": """Imagine yourself in a peaceful meadow...
        The grass is soft beneath you... a gentle breeze touches your skin...

        Above you, the sky is a perfect blue with soft white clouds drifting by...
        You hear birds singing in the distance... leaves rustling gently...

        The sun warms you just enough... you feel completely safe here...
        This is your place of peace... always available to you...

        Breathe in the fresh, clean air... and feel deeply at rest.""",

        "closing": """Slowly begin to bring your awareness back to this room...

        Gently wiggle your fingers and toes...
        Take a deep breath in... and let it out with a sigh...

        When you're ready, slowly open your eyes...

        Thank you for taking this time for yourself.
        Carry this sense of calm with you as you continue your day."""
    }
    return fallbacks.get(stage_id, "Take a moment to breathe and be present.")


@router.websocket("/ws/session")
async def meditation_session(websocket: WebSocket):
    """
    WebSocket endpoint for real-time meditation sessions
    Handles stage progression and real-time guidance
    """
    await websocket.accept()
    print("[MEDITATION] WebSocket connection accepted")

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            if message_data.get("type") == "start_stage":
                stage_id = message_data.get("stage_id")
                print(f"[MEDITATION] Starting stage: {stage_id}")

                # Get stage content
                stage = next((s for s in MEDITATION_STAGES if s["id"] == stage_id), None)
                if stage:
                    try:
                        model = genai.GenerativeModel('gemini-2.0-flash')
                        response = model.generate_content(
                            f"""You are a calm meditation guide. {stage['prompt']}""",
                            generation_config=genai.types.GenerationConfig(
                                temperature=0.7,
                                max_output_tokens=500,
                            )
                        )
                        content = response.text
                    except:
                        content = get_fallback_content(stage_id)

                    await websocket.send_json({
                        "type": "stage_content",
                        "stage_id": stage_id,
                        "content": content,
                        "duration": stage["duration"]
                    })

            elif message_data.get("type") == "stage_complete":
                stage_id = message_data.get("stage_id")
                print(f"[MEDITATION] Stage complete: {stage_id}")
                await websocket.send_json({
                    "type": "stage_complete_ack",
                    "stage_id": stage_id
                })

            elif message_data.get("type") == "session_complete":
                print("[MEDITATION] Session complete")
                await websocket.send_json({
                    "type": "session_complete_ack",
                    "message": "Namaste. Your meditation session is complete."
                })

            elif message_data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        print("[MEDITATION] Client disconnected")
    except Exception as e:
        print(f"[MEDITATION ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        print("[MEDITATION] Session ended")


@router.get("/health")
async def meditation_health():
    """Health check for meditation service"""
    return {
        "status": "ok",
        "service": "meditation",
        "stages": len(MEDITATION_STAGES),
        "total_duration": sum(s["duration"] for s in MEDITATION_STAGES)
    }
