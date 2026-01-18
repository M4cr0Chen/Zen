#!/usr/bin/env python3
"""
Test script to verify RAG (Retrieval-Augmented Generation) system
Tests embeddings generation and vector similarity search
"""

import asyncio
import sys
from app.services.rag import generate_embedding, search_memories
from app.database import get_supabase
from app.config import get_settings

settings = get_settings()
supabase = get_supabase()

# Demo user ID (same as in your backend)
DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"

def test_1_check_journal_entries():
    """Check if journal entries exist in database"""
    print("\n" + "="*60)
    print("TEST 1: Checking journal entries in database")
    print("="*60)

    result = supabase.table("journal_entries").select("id, content, embedding, created_at").eq("user_id", DEMO_USER_ID).execute()

    if not result.data:
        print("❌ No journal entries found!")
        print(f"   Make sure you have entries for user_id: {DEMO_USER_ID}")
        return False

    print(f"✅ Found {len(result.data)} journal entries")

    # Check embeddings
    with_embeddings = sum(1 for entry in result.data if entry.get('embedding') is not None)
    without_embeddings = len(result.data) - with_embeddings

    print(f"\n   📊 Embedding Status:")
    print(f"   - With embeddings: {with_embeddings}")
    print(f"   - Without embeddings: {without_embeddings}")

    if without_embeddings > 0:
        print(f"\n   ⚠️  {without_embeddings} entries are missing embeddings!")
        print("   These entries were likely added manually to the database.")
        print("   They need embeddings for RAG to work properly.")

    print("\n   📝 Sample entries:")
    for i, entry in enumerate(result.data[:3], 1):
        content_preview = entry['content'][:100] + "..." if len(entry['content']) > 100 else entry['content']
        has_embed = "✓" if entry.get('embedding') else "✗"
        print(f"   {i}. [{has_embed}] {content_preview}")

    return len(result.data) > 0

def test_2_generate_embedding():
    """Test embedding generation"""
    print("\n" + "="*60)
    print("TEST 2: Testing embedding generation")
    print("="*60)

    test_text = "I feel stressed about work and need to find balance"

    try:
        embedding = generate_embedding(test_text)
        print(f"✅ Embedding generated successfully")
        print(f"   - Dimensions: {len(embedding)}")
        print(f"   - First 5 values: {embedding[:5]}")
        print(f"   - Model: text-embedding-004 (Gemini)")
        return True
    except Exception as e:
        print(f"❌ Embedding generation failed: {str(e)}")
        print("   Check your GOOGLE_API_KEY in .env")
        return False

async def test_3_semantic_search():
    """Test semantic search with vector similarity"""
    print("\n" + "="*60)
    print("TEST 3: Testing semantic search (RAG)")
    print("="*60)

    # Test queries
    test_queries = [
        "How do I handle stress at work?",
        "What makes me happy?",
        "My relationships with family"
    ]

    all_passed = True

    for query in test_queries:
        print(f"\n   🔍 Query: \"{query}\"")

        try:
            results = await search_memories(DEMO_USER_ID, query, top_k=3)

            if results:
                print(f"   ✅ Found {len(results)} relevant entries:")
                for i, result in enumerate(results, 1):
                    preview = result[:80] + "..." if len(result) > 80 else result
                    print(f"      {i}. {preview}")
            else:
                print(f"   ⚠️  No results found (might need embeddings)")
                all_passed = False

        except Exception as e:
            print(f"   ❌ Search failed: {str(e)}")
            all_passed = False

    return all_passed

async def test_4_add_embedding_to_existing():
    """Generate embeddings for entries that don't have them"""
    print("\n" + "="*60)
    print("TEST 4: Adding embeddings to existing entries")
    print("="*60)

    # Get entries without embeddings
    result = supabase.table("journal_entries")\
        .select("id, content")\
        .eq("user_id", DEMO_USER_ID)\
        .is_("embedding", "null")\
        .execute()

    if not result.data:
        print("✅ All entries already have embeddings!")
        return True

    print(f"Found {len(result.data)} entries without embeddings")
    print("Generating embeddings...")

    success_count = 0
    fail_count = 0

    for entry in result.data:
        try:
            embedding = generate_embedding(entry['content'])

            # Update the entry with embedding
            supabase.table("journal_entries")\
                .update({"embedding": embedding})\
                .eq("id", entry['id'])\
                .execute()

            success_count += 1
            print(f"   ✅ Updated entry {entry['id'][:8]}...")

        except Exception as e:
            fail_count += 1
            print(f"   ❌ Failed for entry {entry['id'][:8]}: {str(e)}")

    print(f"\n   Summary: {success_count} succeeded, {fail_count} failed")
    return fail_count == 0

def test_5_similarity_scores():
    """Test similarity scores between query and documents"""
    print("\n" + "="*60)
    print("TEST 5: Testing similarity scores")
    print("="*60)

    query = "I feel anxious and stressed"

    try:
        # Generate query embedding
        query_embedding = generate_embedding(query)

        # Search with lower threshold to see scores
        result = supabase.rpc('match_journal_entries', {
            'query_embedding': query_embedding,
            'match_threshold': 0.3,  # Lower threshold to see more results
            'match_count': 5,
            'user_id': DEMO_USER_ID
        }).execute()

        if result.data:
            print(f"✅ Found {len(result.data)} matches")
            print(f"\n   Query: \"{query}\"")
            print(f"\n   Results (with similarity scores):")

            for i, entry in enumerate(result.data, 1):
                similarity = entry.get('similarity', 0)
                content_preview = entry['content'][:80] + "..." if len(entry['content']) > 80 else entry['content']

                # Score interpretation
                if similarity > 0.8:
                    quality = "🟢 Excellent"
                elif similarity > 0.6:
                    quality = "🟡 Good"
                else:
                    quality = "🟠 Fair"

                print(f"   {i}. {quality} (score: {similarity:.3f})")
                print(f"      {content_preview}")
                print()

            return True
        else:
            print("⚠️  No matches found - entries may not have embeddings")
            return False

    except Exception as e:
        print(f"❌ Similarity test failed: {str(e)}")
        return False

async def main():
    """Run all tests"""
    print("\n" + "🔬 RAG SYSTEM VERIFICATION" + "\n")
    print(f"User ID: {DEMO_USER_ID}")
    print(f"Supabase URL: {settings.supabase_url}")

    results = []

    # Test 1: Check database entries
    results.append(("Database Entries", test_1_check_journal_entries()))

    # Test 2: Embedding generation
    results.append(("Embedding Generation", test_2_generate_embedding()))

    # Test 3: Semantic search
    results.append(("Semantic Search", await test_3_semantic_search()))

    # Test 4: Add missing embeddings (optional)
    print("\n" + "-"*60)
    user_input = input("Generate embeddings for entries without them? (y/n): ")
    if user_input.lower() == 'y':
        results.append(("Add Embeddings", await test_4_add_embedding_to_existing()))

    # Test 5: Similarity scores
    results.append(("Similarity Scores", test_5_similarity_scores()))

    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)

    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status} - {test_name}")

    total_passed = sum(1 for _, passed in results if passed)
    total_tests = len(results)

    print(f"\nTotal: {total_passed}/{total_tests} tests passed")

    if total_passed == total_tests:
        print("\n🎉 All tests passed! Your RAG system is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())
