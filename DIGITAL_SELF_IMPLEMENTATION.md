# Digital Self Implementation Guide

## Overview

The Digital Self feature analyzes your journal entries using AI to extract deep insights about your personality, values, and patterns. This creates a "mirror" showing who you're becoming based on your own reflections.

## Architecture

### 1. Database Schema (`supabase/digital_self_schema.sql`)

**Tables:**
- `digital_self_insights` - Main record tracking analysis metadata
- `digital_self_values` - Core values (e.g., "Authenticity", "Growth")
- `digital_self_patterns` - Emotional patterns (e.g., "You find peace in solitude")
- `digital_self_themes` - Identity archetypes (e.g., "The Observer", "The Seeker")
- `digital_self_tensions` - Internal polarities (e.g., "Between doing and being")
- `digital_self_keywords` - Single words for visualization

### 2. Backend Service (`app/services/digital_self_analyzer.py`)

**Core Functions:**

#### `analyze_journal_entries(user_id: str) -> Dict`
- Fetches all journal entries for user
- Sends to Gemini 2.5 Flash with analysis prompt
- Returns structured JSON with insights

#### `save_digital_self_insights(user_id: str, analysis: Dict) -> str`
- Saves LLM analysis to database tables
- Returns insight_id

#### `get_digital_self_insights(user_id: str) -> Dict`
- Retrieves latest insights from database
- Returns formatted response for frontend

#### `regenerate_digital_self(user_id: str) -> Dict`
- Analyzes entries + saves to database
- Full pipeline for regenerating insights

### 3. API Endpoints (`app/routers/digital_self.py`)

**Endpoints:**

```
GET  /api/digital-self/insights
     - Returns latest insights or mocked data if none exist
     - Query param: user_id (optional, defaults to demo user)

POST /api/digital-self/regenerate
     - Analyzes journal entries and generates new insights
     - Body: { user_id?: string }
     - Returns: { status, message, insights }

GET  /api/digital-self/status
     - Check if user has analysis
     - Returns: { hasAnalysis, journalEntriesAnalyzed, lastAnalysisDate }
```

### 4. Frontend (`frontend/app/digital-self/page.tsx`)

**Features:**
- Fetches insights from API on mount
- Displays: Core Values, Emotional Patterns, Identity Themes, Tensions
- Animated floating keywords visualization
- "Regenerate Insights" button to trigger new analysis
- Loading states during regeneration

## Setup Instructions

### 1. Run Database Migration

```bash
# In Supabase SQL Editor, run:
supabase/digital_self_schema.sql
```

Or via CLI:
```bash
psql $SUPABASE_DB_URL < supabase/digital_self_schema.sql
```

### 2. Restart Backend

```bash
cd backend
python -m app.main
```

The new `/api/digital-self/*` endpoints will be available.

### 3. Restart Frontend

```bash
cd frontend
npm run dev
```

Navigate to `/digital-self` to see the page.

## Usage Flow

### First Time User:
1. User visits `/digital-self` page
2. Frontend calls `GET /api/digital-self/insights`
3. Backend returns mocked data (since no analysis exists)
4. User clicks "Regenerate Insights"
5. Backend analyzes all journal entries with LLM
6. Insights saved to database and displayed

### Returning User:
1. User visits `/digital-self` page
2. Frontend calls `GET /api/digital-self/insights`
3. Backend returns latest insights from database
4. Insights displayed immediately
5. User can click "Regenerate" for fresh analysis

## LLM Analysis Process

### Prompt Structure:
```
Input: All user's journal entries (up to 50 most recent)
Task: Extract insights about the person
Output: JSON with 5 categories
```

### JSON Schema:
```json
{
  "coreValues": ["Value1", "Value2", ...],
  "emotionalPatterns": ["Pattern sentence", ...],
  "identityThemes": [
    {"name": "The Observer", "description": "..."},
    ...
  ],
  "tensions": ["Between X and Y", ...],
  "keywords": ["word1", "word2", ...]
}
```

### Response Parsing:
- Strips markdown code blocks (```json)
- Validates required fields
- Handles both object and string formats for themes
- Graceful error handling with detailed logs

## API Examples

### Get Insights
```bash
curl http://localhost:8000/api/digital-self/insights
```

Response:
```json
{
  "coreValues": ["Authenticity", "Growth"],
  "emotionalPatterns": ["You find peace in solitude"],
  "identityThemes": ["The Observer", "The Learner"],
  "tensions": ["Between doing and being"],
  "keywords": ["present", "seeking"],
  "analysisDate": "2025-01-18T12:00:00Z",
  "journalEntriesAnalyzed": 12
}
```

### Regenerate Insights
```bash
curl -X POST http://localhost:8000/api/digital-self/regenerate \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:
```json
{
  "status": "success",
  "message": "Analyzed 12 journal entries",
  "insights": { ... }
}
```

### Check Status
```bash
curl http://localhost:8000/api/digital-self/status
```

Response:
```json
{
  "hasAnalysis": true,
  "journalEntriesAnalyzed": 12,
  "lastAnalysisDate": "2025-01-18T12:00:00Z"
}
```

## Testing

### Manual Test:
1. Ensure you have journal entries in database
2. Visit `http://localhost:3000/digital-self`
3. Click "Regenerate Insights"
4. Wait for analysis (5-10 seconds)
5. Verify insights displayed

### Backend Test Script:
```python
# backend/test_digital_self.py
import asyncio
from app.services.digital_self_analyzer import regenerate_digital_self

async def test():
    result = await regenerate_digital_self("00000000-0000-0000-0000-000000000001")
    print("Analysis complete!")
    print(f"Core Values: {result['coreValues']}")
    print(f"Patterns: {result['emotionalPatterns']}")

asyncio.run(test())
```

Run:
```bash
cd backend
source venv/bin/activate
python test_digital_self.py
```

## Design Philosophy

### Why This Approach?
1. **Separation of Concerns**: Database, service layer, API, and frontend are cleanly separated
2. **LLM as Analyzer**: Gemini 2.5 Flash provides deep psychological insights
3. **Structured Output**: JSON schema ensures consistent, parseable results
4. **Graceful Degradation**: Mocked data shown if no analysis exists yet
5. **User Control**: Regenerate button gives users agency over analysis

### Why These Insights?
- **Core Values**: What matters most to the person
- **Emotional Patterns**: How they feel and respond
- **Identity Themes**: Archetypal self-concepts
- **Tensions**: Growth areas and internal conflicts
- **Keywords**: Single words capturing essence (for visualization)

## Troubleshooting

### Issue: "No journal entries found"
- Ensure user has entries in `journal_entries` table
- Check `user_id` matches (default: `00000000-0000-0000-0000-000000000001`)

### Issue: "LLM returned invalid JSON"
- Check Gemini API quota
- Review console logs for LLM response
- Adjust temperature or max_tokens in analyzer

### Issue: Frontend shows mocked data
- Click "Regenerate Insights" button
- Check browser console for API errors
- Verify backend is running on port 8000

### Issue: Regenerate button does nothing
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check backend logs for analysis errors

## Future Enhancements

1. **Progressive Analysis**: Analyze incrementally as new entries added
2. **Trend Tracking**: Show how values/patterns change over time
3. **Visualization**: Interactive graphs of emotional patterns
4. **Export**: Download insights as PDF or shareable image
5. **Comparison**: Compare insights across time periods
6. **Privacy**: User-controlled visibility settings
7. **Mentor Matching**: Auto-suggest mentors based on values/tensions

## Security Considerations

- All insights private to user (no sharing yet)
- No foreign key constraints (hackathon mode, bypassing auth)
- Add RLS policies in production
- Sanitize LLM output before storing
- Rate limit regeneration endpoint (expensive operation)

## Performance Notes

- Analysis takes 5-10 seconds for 10-50 entries
- Limit to 50 most recent entries to avoid token limits
- Truncate entries text to 15,000 chars max
- Cache insights in database (no need to regenerate every visit)
- Consider background job queue for analysis in production
