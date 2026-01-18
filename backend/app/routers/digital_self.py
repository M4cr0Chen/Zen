"""
Digital Self API Router
Endpoints for generating and retrieving digital self insights
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.services.digital_self_analyzer import (
    get_digital_self_insights,
    regenerate_digital_self
)

router = APIRouter()

# Demo user UUID for hackathon
DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"


class DigitalSelfResponse(BaseModel):
    coreValues: List[str]
    emotionalPatterns: List[str]
    identityThemes: List[str]
    tensions: List[str]
    keywords: List[str]
    analysisDate: Optional[str] = None
    journalEntriesAnalyzed: Optional[int] = 0


class RegenerateRequest(BaseModel):
    user_id: Optional[str] = None


@router.get("/insights")
async def get_insights(user_id: str = DEMO_USER_ID):
    """
    Get the latest digital self insights for a user

    Returns mocked data if no insights exist yet
    """
    try:
        insights = await get_digital_self_insights(user_id)

        if not insights:
            # Return default/mocked data if no analysis exists yet
            return {
                "coreValues": [
                    "Authenticity",
                    "Growth",
                    "Connection",
                    "Compassion",
                    "Curiosity"
                ],
                "emotionalPatterns": [
                    "You often find peace in solitude",
                    "Uncertainty precedes your moments of growth",
                    "Gratitude appears in quiet observations"
                ],
                "identityThemes": [
                    "The Observer",
                    "The Learner",
                    "The Seeker",
                    "The Gentle Warrior"
                ],
                "tensions": [
                    "Between doing and being",
                    "Between certainty and exploration",
                    "Between connection and solitude"
                ],
                "keywords": ["present", "tender", "seeking", "authentic", "evolving"],
                "analysisDate": None,
                "journalEntriesAnalyzed": 0
            }

        return insights

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/regenerate")
async def regenerate_insights(request: RegenerateRequest):
    """
    Regenerate digital self insights by analyzing journal entries

    This will:
    1. Fetch all journal entries for the user
    2. Use LLM to analyze and extract insights
    3. Save insights to database
    4. Return the new insights
    """
    user_id = request.user_id or DEMO_USER_ID

    try:
        insights = await regenerate_digital_self(user_id)

        return {
            "status": "success",
            "message": f"Analyzed {insights.get('journalEntriesAnalyzed', 0)} journal entries",
            "insights": {
                "coreValues": insights.get("coreValues", []),
                "emotionalPatterns": insights.get("emotionalPatterns", []),
                "identityThemes": insights.get("identityThemes", []),
                "tensions": insights.get("tensions", []),
                "keywords": insights.get("keywords", [])
            }
        }

    except Exception as e:
        print(f"Error regenerating digital self: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to regenerate insights: {str(e)}"
        )


@router.get("/status")
async def get_status(user_id: str = DEMO_USER_ID):
    """
    Get status of digital self analysis for a user
    """
    try:
        insights = await get_digital_self_insights(user_id)

        if not insights:
            return {
                "hasAnalysis": False,
                "journalEntriesAnalyzed": 0,
                "lastAnalysisDate": None
            }

        return {
            "hasAnalysis": True,
            "journalEntriesAnalyzed": insights.get("journalEntriesAnalyzed", 0),
            "lastAnalysisDate": insights.get("analysisDate")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
