"""
Digital Self Analyzer Service
Analyzes journal entries to extract personal insights using LLM
"""

import google.generativeai as genai
from app.config import get_settings
from app.database import get_supabase
from typing import Dict, List
import json

settings = get_settings()
genai.configure(api_key=settings.google_api_key)
supabase = get_supabase()

ANALYSIS_PROMPT = """You are a thoughtful psychologist analyzing someone's journal entries to understand their inner world.

Your task is to analyze the journal entries below and extract deep insights about this person's:
1. Core Values - What matters most to them (5 values maximum)
2. Emotional Patterns - Recurring emotional themes (3-4 patterns)
3. Identity Themes - Who they see themselves as (3-4 archetypal identities)
4. Tensions - Internal conflicts or polarities they navigate (3 tensions)
5. Keywords - Single words that capture their essence (5 keywords for visualization)

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{{
  "coreValues": ["Value1", "Value2", ...],
  "emotionalPatterns": ["Pattern 1", "Pattern 2", ...],
  "identityThemes": [
    {{"name": "The Observer", "description": "Brief description"}},
    ...
  ],
  "tensions": ["Between X and Y", ...],
  "keywords": ["word1", "word2", ...]
}}

Guidelines:
- Core values: Single words or short phrases (e.g., "Authenticity", "Growth", "Connection")
- Emotional patterns: Complete sentences describing their emotional tendencies
- Identity themes: Archetypal names (e.g., "The Seeker", "The Gentle Warrior")
- Tensions: Phrases starting with "Between..." describing internal polarities
- Keywords: Single evocative words that appear frequently or are central to their identity

Journal Entries to Analyze:
---
{{entries}}
---

Return ONLY the JSON object, no other text.
"""

async def analyze_journal_entries(user_id: str) -> Dict:
    """
    Analyze all journal entries for a user and extract digital self insights

    Returns:
        Dict with coreValues, emotionalPatterns, identityThemes, tensions, keywords
    """

    # Fetch all journal entries for the user
    result = supabase.table("journal_entries")\
        .select("content, created_at")\
        .eq("user_id", user_id)\
        .order("created_at", desc=False)\
        .execute()

    if not result.data or len(result.data) == 0:
        raise Exception("No journal entries found for analysis")

    # Prepare journal entries for analysis
    entries_text = "\n\n".join([
        f"Entry {i+1} ({entry['created_at'][:10]}):\n{entry['content']}"
        for i, entry in enumerate(result.data)
    ])

    # Limit to last 50 entries or 15000 chars to avoid token limits
    entries_list = result.data[-50:] if len(result.data) > 50 else result.data
    entries_text = "\n\n".join([
        f"Entry {i+1}:\n{entry['content']}"
        for i, entry in enumerate(entries_list)
    ])

    # Truncate if too long
    if len(entries_text) > 15000:
        entries_text = entries_text[:15000] + "\n\n[... additional entries truncated]"

    print(f"\n{'='*60}")
    print(f"DEBUG: Analyzing {len(entries_list)} journal entries")
    print(f"DEBUG: Total text length: {len(entries_text)} chars")
    print(f"DEBUG: First entry preview: {entries_list[0]['content'][:100]}...")
    print(f"{'='*60}\n")

    # Generate analysis using Gemini
    model = genai.GenerativeModel('gemini-2.5-flash')

    # Build prompt - replace {{entries}} placeholder
    prompt = ANALYSIS_PROMPT.replace("{{entries}}", entries_text)

    print(f"DEBUG: Prompt length: {len(prompt)} chars")
    print(f"DEBUG: Sending to Gemini...\n")

    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.7,
            max_output_tokens=4096,  # Increased to allow full response
        )
    )

    # Parse JSON response
    try:
        # Clean response text (remove markdown code blocks if present)
        response_text = response.text.strip()

        # Remove markdown code blocks
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]

        if response_text.endswith("```"):
            response_text = response_text[:-3]

        response_text = response_text.strip()

        # Log for debugging
        print(f"\n{'='*60}")
        print(f"DEBUG: LLM Response received")
        print(f"DEBUG: Response length: {len(response_text)} chars")
        print(f"DEBUG: Response preview (first 300 chars):\n{response_text[:300]}")
        if len(response_text) > 300:
            print(f"DEBUG: Response end (last 100 chars):\n...{response_text[-100:]}")
        print(f"{'='*60}\n")

        analysis = json.loads(response_text)

        # Validate required fields
        required_fields = ["coreValues", "emotionalPatterns", "identityThemes", "tensions", "keywords"]
        for field in required_fields:
            if field not in analysis:
                raise ValueError(f"Missing required field: {field}")

        # Add metadata
        analysis["journalEntriesAnalyzed"] = len(entries_list)

        print(f"✅ Successfully parsed analysis with {len(entries_list)} entries")
        return analysis

    except json.JSONDecodeError as e:
        print(f"\n{'!'*60}")
        print(f"ERROR: Failed to parse LLM response as JSON")
        print(f"ERROR: {e}")
        print(f"ERROR: Full response text:")
        print(f"{response.text}")
        print(f"{'!'*60}\n")
        raise Exception(f"LLM returned invalid JSON: {str(e)}")


async def save_digital_self_insights(user_id: str, analysis: Dict) -> str:
    """
    Save digital self insights to database

    Returns:
        insight_id (UUID)
    """

    # Create main insight record
    insight_result = supabase.table("digital_self_insights").insert({
        "user_id": user_id,
        "journal_entries_analyzed": analysis.get("journalEntriesAnalyzed", 0)
    }).execute()

    insight_id = insight_result.data[0]["id"]

    # Save core values
    values_data = [
        {
            "insight_id": insight_id,
            "user_id": user_id,
            "value_name": value,
            "confidence_score": 0.8
        }
        for value in analysis.get("coreValues", [])
    ]
    if values_data:
        supabase.table("digital_self_values").insert(values_data).execute()

    # Save emotional patterns
    patterns_data = [
        {
            "insight_id": insight_id,
            "user_id": user_id,
            "pattern_text": pattern,
            "category": "emotional"
        }
        for pattern in analysis.get("emotionalPatterns", [])
    ]
    if patterns_data:
        supabase.table("digital_self_patterns").insert(patterns_data).execute()

    # Save identity themes
    themes_data = []
    for theme in analysis.get("identityThemes", []):
        if isinstance(theme, dict):
            themes_data.append({
                "insight_id": insight_id,
                "user_id": user_id,
                "theme_name": theme.get("name", ""),
                "description": theme.get("description", "")
            })
        else:
            # Handle if LLM returns just strings
            themes_data.append({
                "insight_id": insight_id,
                "user_id": user_id,
                "theme_name": str(theme),
                "description": ""
            })
    if themes_data:
        supabase.table("digital_self_themes").insert(themes_data).execute()

    # Save tensions
    tensions_data = [
        {
            "insight_id": insight_id,
            "user_id": user_id,
            "tension_description": tension
        }
        for tension in analysis.get("tensions", [])
    ]
    if tensions_data:
        supabase.table("digital_self_tensions").insert(tensions_data).execute()

    # Save keywords
    keywords_data = [
        {
            "insight_id": insight_id,
            "user_id": user_id,
            "keyword": keyword,
            "frequency": 1
        }
        for keyword in analysis.get("keywords", [])
    ]
    if keywords_data:
        supabase.table("digital_self_keywords").insert(keywords_data).execute()

    return insight_id


async def get_digital_self_insights(user_id: str) -> Dict:
    """
    Retrieve the latest digital self insights for a user

    Returns:
        Dict with coreValues, emotionalPatterns, identityThemes, tensions, keywords
    """

    # Get latest insight record
    insight_result = supabase.table("digital_self_insights")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("updated_at", desc=True)\
        .limit(1)\
        .execute()

    if not insight_result.data:
        return None

    insight_id = insight_result.data[0]["id"]

    # Fetch all related data
    values = supabase.table("digital_self_values")\
        .select("value_name")\
        .eq("insight_id", insight_id)\
        .execute()

    patterns = supabase.table("digital_self_patterns")\
        .select("pattern_text")\
        .eq("insight_id", insight_id)\
        .execute()

    themes = supabase.table("digital_self_themes")\
        .select("theme_name, description")\
        .eq("insight_id", insight_id)\
        .execute()

    tensions = supabase.table("digital_self_tensions")\
        .select("tension_description")\
        .eq("insight_id", insight_id)\
        .execute()

    keywords = supabase.table("digital_self_keywords")\
        .select("keyword")\
        .eq("insight_id", insight_id)\
        .execute()

    # Format response
    return {
        "coreValues": [v["value_name"] for v in values.data],
        "emotionalPatterns": [p["pattern_text"] for p in patterns.data],
        "identityThemes": [t["theme_name"] for t in themes.data],
        "tensions": [t["tension_description"] for t in tensions.data],
        "keywords": [k["keyword"] for k in keywords.data],
        "analysisDate": insight_result.data[0]["analysis_date"],
        "journalEntriesAnalyzed": insight_result.data[0]["journal_entries_analyzed"]
    }


async def regenerate_digital_self(user_id: str) -> Dict:
    """
    Regenerate digital self insights by analyzing journal entries

    Returns:
        Dict with insights
    """

    # Analyze journal entries
    analysis = await analyze_journal_entries(user_id)

    # Delete old insights for this user (optional - or keep history)
    # For now, we'll keep old insights and just create new ones

    # Save new insights
    insight_id = await save_digital_self_insights(user_id, analysis)

    # Return the analysis
    return {
        **analysis,
        "insightId": insight_id
    }
