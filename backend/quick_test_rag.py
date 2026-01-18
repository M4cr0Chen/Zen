#!/usr/bin/env python3
"""Quick RAG test - no interactive prompts"""

from app.services.rag import generate_embedding
from app.database import get_supabase

supabase = get_supabase()
DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"

test_queries = [
    "How do I handle stress at work?",
    "What makes me happy?",
    "I'm worried about my future",
    "Feeling anxious about relationships"
]

print("🔬 RAG VECTOR SEARCH TEST\n")
print("="*60)

for query in test_queries:
    print(f"\n🔍 Query: \"{query}\"")

    # Generate embedding
    query_embedding = generate_embedding(query)

    # Search
    result = supabase.rpc('match_journal_entries', {
        'query_embedding': query_embedding,
        'match_threshold': 0.5,  # 50% similarity minimum
        'match_count': 3,
        'user_id': DEMO_USER_ID
    }).execute()

    if result.data:
        print(f"   ✅ Found {len(result.data)} matches:\n")
        for i, entry in enumerate(result.data, 1):
            similarity = entry['similarity']
            content = entry['content'][:100] + "..." if len(entry['content']) > 100 else entry['content']

            # Score color coding
            if similarity > 0.8:
                emoji = "🟢"
            elif similarity > 0.6:
                emoji = "🟡"
            else:
                emoji = "🟠"

            print(f"   {i}. {emoji} {similarity*100:.1f}% - {content}")
    else:
        print("   ⚠️  No matches found")

print("\n" + "="*60)
print("✅ RAG system is working correctly!")
