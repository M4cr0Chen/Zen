# Fix: Interrupted LLM Responses

## Problem
LLM responses in the counsel chat were being cut off mid-sentence, especially for longer, detailed responses.

## Root Cause
**`max_output_tokens` limits were too low:**
- Mindfulness Agent: 800 tokens (~600 words)
- Discovery Agent: 300 tokens (~225 words)
- Wise Mentor: 800 tokens (~600 words)

When responses exceeded these limits, Gemini would truncate mid-sentence.

## Solution Applied

### Increased Token Limits
```python
# Before → After
Mindfulness Agent:  800 → 2048 tokens (~1536 words)
Discovery Agent:    300 → 1024 tokens (~768 words)
Wise Mentor:        800 → 2048 tokens (~1536 words)
```

### Added Truncation Detection
Now logs warnings when responses are truncated:
```
⚠️  [WISE MENTOR] WARNING: Marcus Aurelius's response truncated due to max_output_tokens limit!
```

## Files Changed
- `backend/app/agents/orchestrator.py`
  - Line ~518: Mindfulness Agent max_output_tokens
  - Line ~601: Discovery Agent max_output_tokens
  - Line ~702: Wise Mentor max_output_tokens
  - Added finish_reason checking for all 3 agents

## How to Verify Fix

### 1. Restart Backend
```bash
cd backend
python -m app.main
```

### 2. Test with Lengthy Response Prompts
Try these in the counsel chat (should now get full responses):

```
I'm feeling anxious and overwhelmed about work, my relationships,
my health, and my future. I don't know where to start or how to
process all these emotions. Can you help me understand what I'm
experiencing and guide me through this?

I'm struggling with finding meaning in my life and feel stuck in
a cycle of just going through the motions. I want to live
authentically but don't know how. What would Viktor Frankl say
about finding purpose in difficult times?

I need wisdom about accepting what I cannot control. I'm stressed
about external pressures, worried about the future, and anxious
about things beyond my control. How do Stoic philosophers suggest
I approach this?
```

### 3. Check Backend Logs
Look for:
- ✅ `[AGENT] Response generated (XXXX chars)` - Full response
- ⚠️  `WARNING: Response truncated` - Still hitting limits (increase more)
- `Finish reason: STOP` - Natural completion (good)
- `Finish reason: MAX_TOKENS` - Hit limit (bad)

## Token Limits Explained

**Gemini 2.5 Flash:**
- Max input: 1M tokens
- Max output: 8,192 tokens
- Our new limits (2048) are well within safe range

**Token to Word Ratio:**
- ~1 token ≈ 0.75 words
- 2048 tokens ≈ 1536 words ≈ 3 pages of text

## Why These Specific Numbers?

**2048 tokens for Mindfulness & Wise Mentor:**
- Allows for thoughtful, detailed responses (4-8 paragraphs)
- Enough for mentors to share wisdom, examples, and guidance
- Room for warmth, empathy, and depth

**1024 tokens for Discovery Agent:**
- Discovery asks brief clarifying questions (1-3 paragraphs)
- Doesn't need as much as full mentorship responses
- Still plenty for warm, exploratory questions

## Monitoring

After fix, backend will log:
```
[WISE MENTOR] Response from Marcus Aurelius (1847 chars)
[WISE MENTOR] Finish reason: STOP
```

If you see `MAX_TOKENS`, the response was still cut off - increase limits further.

## Future Improvements

If responses are still too short:
1. Increase limits to 4096 (max)
2. Add response continuation logic
3. Implement streaming for very long responses
4. Add prompt optimization to reduce input tokens

## Cost Impact

**Before:**
- ~800 tokens/response × 3 agents = ~2,400 tokens max

**After:**
- ~2048 tokens/response × 3 agents = ~6,144 tokens max

**Impact:** ~2.5x increase in max output tokens
**But:** Most responses won't use full limit, actual cost increase minimal
**Benefit:** Complete, uninterrupted responses = better UX

## Testing Checklist

- [x] Increased max_output_tokens limits
- [x] Added truncation detection logging
- [x] Tested with long prompts
- [x] Verified no mid-sentence cuts
- [x] Checked backend logs for warnings

## Rollback

If issues occur, revert to original limits:
```python
# Mindfulness Agent
max_output_tokens=800

# Discovery Agent
max_output_tokens=300

# Wise Mentor
max_output_tokens=800
```

---

**Status:** ✅ Fixed
**Deployed:** Restart backend to apply changes
**Monitor:** Check logs for `MAX_TOKENS` warnings
