#!/usr/bin/env python3
"""
Test script for LangGraph agents
Demonstrates different routing scenarios and mentor selection
"""

import asyncio
from app.agents.orchestrator import council_graph, AgentState

# Demo user ID
DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"

# ============================================================================
# TEST SCENARIOS
# ============================================================================

TEST_SCENARIOS = [
    {
        "category": "🧘 EMOTIONAL SUPPORT (→ Mindfulness Agent)",
        "messages": [
            "I'm feeling really anxious and overwhelmed right now",
            "I feel so lonely and disconnected from everyone",
            "I'm crying and don't know why I'm so sad",
            "I'm frustrated and angry at myself for failing again",
            "I feel stressed about everything and can't calm down",
        ]
    },
    {
        "category": "💪 STOIC WISDOM (→ Marcus Aurelius/Seneca/Epictetus)",
        "messages": [
            "I'm stressed about things I can't control at work",
            "I feel overwhelmed by external pressures and expectations",
            "How do I accept things I cannot change?",
            "I'm anxious about the future and what might go wrong",
            "I need help managing my anger and rage",
        ]
    },
    {
        "category": "🧘‍♂️ MINDFULNESS (→ Thich Nhat Hanh/Dalai Lama/Buddha)",
        "messages": [
            "How can I be more present in the moment?",
            "I want to practice more compassion for myself",
            "I'm suffering from attachment to outcomes",
            "How do I find inner peace?",
            "I need help with meditation and mindfulness",
        ]
    },
    {
        "category": "💔 VULNERABILITY & SHAME (→ Brené Brown)",
        "messages": [
            "I feel so much shame about my past mistakes",
            "I'm afraid to be vulnerable with people",
            "I don't feel like I'm enough or worthy of love",
            "How do I find the courage to be authentic?",
            "I'm scared people will judge me if I share my truth",
        ]
    },
    {
        "category": "🎯 PURPOSE & MEANING (→ Viktor Frankl)",
        "messages": [
            "My life feels meaningless and I don't know why I'm here",
            "I'm suffering and can't find any purpose in it",
            "What's the point of all this struggle?",
            "How do I find meaning in my work?",
            "I feel hopeless about the future",
        ]
    },
    {
        "category": "🌊 FLOW & ADAPTATION (→ Bruce Lee/Laozi)",
        "messages": [
            "I need to learn to adapt to changing circumstances",
            "Everything feels forced and I'm pushing too hard",
            "How can I be more like water and flow?",
            "I feel stuck in rigid thinking patterns",
            "I want to find the natural way forward",
        ]
    },
    {
        "category": "🎨 CREATIVITY & SELF-EXPRESSION (→ Frida Kahlo/Van Gogh)",
        "messages": [
            "I want to transform my pain into something beautiful",
            "How do I stay authentic in my creative work?",
            "I feel misunderstood as an artist",
            "I struggle with expressing my true self",
            "My passion for art consumes me but also sustains me",
        ]
    },
    {
        "category": "💡 INNOVATION & VISION (→ Steve Jobs/Einstein)",
        "messages": [
            "I have a vision but don't know how to make it real",
            "How do I simplify my complex ideas?",
            "I want to create something that makes a dent in the universe",
            "I'm curious about everything and want to keep learning",
            "How do I think differently from everyone else?",
        ]
    },
    {
        "category": "🦅 COURAGE & RESILIENCE (→ Maya Angelou/Eleanor Roosevelt)",
        "messages": [
            "I need strength to overcome this difficult time",
            "How do I rise above my circumstances?",
            "I'm afraid but want to find courage",
            "How do I maintain my dignity when others put me down?",
            "I feel inferior and need to build confidence",
        ]
    },
    {
        "category": "❤️ LOVE & SPIRITUALITY (→ Rumi/Mother Teresa)",
        "messages": [
            "My heart feels broken and I'm longing for connection",
            "How do I transform my wounds into light?",
            "I want to serve others but feel small and limited",
            "How can I love myself and others more deeply?",
            "I'm searching for divine connection",
        ]
    },
    {
        "category": "⚔️ STRATEGY & MASTERY (→ Sun Tzu/Miyamoto Musashi)",
        "messages": [
            "I'm in conflict with someone and need strategy",
            "How do I master my craft through discipline?",
            "I need to understand myself and my competition better",
            "What's the path to true mastery?",
            "How do I win without fighting?",
        ]
    },
    {
        "category": "🌟 HERO'S JOURNEY (→ Joseph Campbell)",
        "messages": [
            "I feel called to an adventure but I'm scared",
            "What's my hero's journey?",
            "How do I follow my bliss?",
            "The cave I fear to enter might hold treasure",
            "I'm at a crossroads and don't know which path to take",
        ]
    },
    {
        "category": "🔍 SELF-EXAMINATION (→ Socrates)",
        "messages": [
            "I'm confused about what I really believe",
            "How do I find truth and meaning?",
            "I have so many questions about life",
            "Help me examine my beliefs more deeply",
            "I realize I know nothing",
        ]
    },
    {
        "category": "⚖️ JUSTICE & FAIRNESS (→ Plato/MLK Jr./Mandela)",
        "messages": [
            "I'm facing injustice and don't know how to respond",
            "How do I fight for what's right?",
            "I want to create change but feel powerless",
            "How do I forgive those who wronged me?",
            "I dream of a more just world",
        ]
    },
    {
        "category": "🎭 IDENTITY & AUTHENTICITY (→ Simone de Beauvoir/Carl Jung)",
        "messages": [
            "Who am I really? I feel like I'm playing a role",
            "I need to integrate my shadow self",
            "How do I become who I'm meant to be?",
            "I'm exploring my unconscious patterns",
            "What does it mean to be authentic?",
        ]
    },
]

# ============================================================================
# EDGE CASES & SPECIAL SCENARIOS
# ============================================================================

EDGE_CASES = {
    "category": "🔧 EDGE CASES",
    "messages": [
        "Hey",  # Very short - should trigger discovery
        "I need help with my life" * 20,  # Very long - skip discovery
        "What is the meaning of life, the universe, and everything? I've been pondering this for years and tried meditation, philosophy, therapy, and nothing gives me a clear answer. I feel like I'm searching for something that might not even exist.",  # Long + philosophical
        "help",  # One word
        "I'm feeling stressed about my creative work and need to adapt my strategy to overcome barriers while finding meaning",  # Multiple keywords - which mentor wins?
    ]
}

# ============================================================================
# CONVERSATION FLOWS
# ============================================================================

CONVERSATION_FLOWS = [
    {
        "name": "Discovery → Mentor Flow",
        "messages": [
            "I'm struggling with something",  # Short - triggers discovery
            "It's about my career and feeling stuck",  # Discovery response
            "I feel like I'm not living authentically",  # Should now go to mentor
        ]
    },
    {
        "name": "Emotional → Advice Flow",
        "messages": [
            "I'm feeling so sad and overwhelmed",  # Mindfulness
            "Thank you, that helps. Now I need guidance on what to do",  # Should route to mentor
        ]
    },
    {
        "name": "Multi-turn with Same Mentor",
        "messages": [
            "I need to accept what I cannot control",  # Marcus Aurelius
            "How do I practice that daily?",  # Should stay with Marcus
            "What about when emotions overwhelm me?",  # Might switch to mindfulness
        ]
    }
]

# ============================================================================
# TEST RUNNER
# ============================================================================

async def test_single_message(message: str, verbose: bool = True):
    """Test a single message through the agent system"""

    initial_state = {
        "messages": [{"role": "user", "content": message}],
        "user_id": DEMO_USER_ID,
        "context": "",
        "current_agent": "router",
        "discovery_complete": False,
        "selected_mentor": None,
        "user_situation": ""
    }

    try:
        result = await council_graph.ainvoke(initial_state)

        response = result["messages"][-1]["content"] if result["messages"] else "No response"
        agent = result.get("current_agent", "unknown")
        mentor = result.get("selected_mentor", {})
        mentor_name = mentor.get("name", "N/A") if mentor else "N/A"

        if verbose:
            print(f"\n{'─'*80}")
            print(f"📝 INPUT: {message}")
            print(f"🤖 AGENT: {agent}")
            if mentor:
                print(f"🎭 MENTOR: {mentor_name}")
            print(f"💬 RESPONSE: {response[:200]}{'...' if len(response) > 200 else ''}")

        return {
            "input": message,
            "agent": agent,
            "mentor": mentor_name,
            "response": response,
            "full_state": result
        }

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return None


async def test_conversation_flow(flow: dict):
    """Test a multi-turn conversation"""

    print(f"\n{'='*80}")
    print(f"🔄 CONVERSATION FLOW: {flow['name']}")
    print(f"{'='*80}")

    state = {
        "messages": [],
        "user_id": DEMO_USER_ID,
        "context": "",
        "current_agent": "router",
        "discovery_complete": False,
        "selected_mentor": None,
        "user_situation": ""
    }

    for i, message in enumerate(flow['messages'], 1):
        print(f"\n--- Turn {i} ---")
        state["messages"].append({"role": "user", "content": message})

        try:
            result = await council_graph.ainvoke(state)

            response = result["messages"][-1]["content"]
            agent = result.get("current_agent", "unknown")
            mentor = result.get("selected_mentor", {})
            mentor_name = mentor.get("name", "N/A") if mentor else "N/A"

            print(f"📝 USER: {message}")
            print(f"🤖 AGENT: {agent}")
            if mentor:
                print(f"🎭 MENTOR: {mentor_name}")
            print(f"💬 ASSISTANT: {response[:150]}...")

            # Update state for next turn
            state = result

        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            break


async def run_all_tests():
    """Run all test scenarios"""

    print("\n" + "="*80)
    print("🧪 LANGGRAPH AGENT SYSTEM TEST SUITE")
    print("="*80)

    # Test 1: Single message scenarios
    print("\n\n📋 TEST 1: SINGLE MESSAGE ROUTING")
    print("="*80)

    for scenario in TEST_SCENARIOS:
        print(f"\n\n{scenario['category']}")
        print("─"*80)

        # Test just the first 2 messages from each category
        for message in scenario['messages'][:2]:
            await test_single_message(message, verbose=True)
            await asyncio.sleep(1)  # Rate limiting

    # Test 2: Edge cases
    print("\n\n📋 TEST 2: EDGE CASES")
    print("="*80)

    for message in EDGE_CASES['messages']:
        await test_single_message(message, verbose=True)
        await asyncio.sleep(1)

    # Test 3: Conversation flows
    print("\n\n📋 TEST 3: CONVERSATION FLOWS")
    print("="*80)

    for flow in CONVERSATION_FLOWS:
        await test_conversation_flow(flow)
        await asyncio.sleep(2)

    print("\n\n" + "="*80)
    print("✅ ALL TESTS COMPLETE")
    print("="*80)


async def interactive_mode():
    """Interactive mode to test custom messages"""

    print("\n" + "="*80)
    print("💬 INTERACTIVE MODE")
    print("="*80)
    print("Type your messages to test the agent system.")
    print("Type 'quit' to exit.\n")

    state = {
        "messages": [],
        "user_id": DEMO_USER_ID,
        "context": "",
        "current_agent": "router",
        "discovery_complete": False,
        "selected_mentor": None,
        "user_situation": ""
    }

    while True:
        user_input = input("\n🧑 YOU: ").strip()

        if user_input.lower() in ['quit', 'exit', 'q']:
            print("\n👋 Goodbye!")
            break

        if not user_input:
            continue

        state["messages"].append({"role": "user", "content": user_input})

        try:
            result = await council_graph.ainvoke(state)

            response = result["messages"][-1]["content"]
            agent = result.get("current_agent", "unknown")
            mentor = result.get("selected_mentor", {})

            print(f"\n🤖 AGENT: {agent}")
            if mentor:
                print(f"🎭 MENTOR: {mentor.get('name', 'N/A')}")
            print(f"\n💬 ASSISTANT: {response}\n")

            state = result

        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}\n")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "interactive":
        asyncio.run(interactive_mode())
    else:
        asyncio.run(run_all_tests())
