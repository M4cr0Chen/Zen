from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse, ChatMessage
from app.agents.orchestrator import council_graph, AgentState

router = APIRouter()

# Demo user UUID for hackathon (bypassing auth)
DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"

# Store conversation state per user (in production, use Redis or database)
conversation_states = {}

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest) -> ChatResponse:
    """
    Send a message to the Council and get a response

    The orchestrator will route to the appropriate agent
    """
    try:
        print(f"[CHAT] Received message: {request.message[:50]}...")

        # Use demo user ID if not provided
        user_id = request.user_id if request.user_id else DEMO_USER_ID
        print(f"[CHAT] User ID: {user_id}")

        # Get or create conversation state for this user
        if user_id in conversation_states:
            # Continue existing conversation
            existing_state = conversation_states[user_id]
            initial_state: AgentState = {
                "messages": existing_state.get("messages", []) + [{"role": "user", "content": request.message}],
                "user_id": user_id,
                "context": existing_state.get("context", ""),
                "current_agent": "orchestrator",
                "discovery_complete": existing_state.get("discovery_complete", False),
                "selected_mentor": existing_state.get("selected_mentor", None),
                "user_situation": existing_state.get("user_situation", "")
            }
        else:
            # New conversation
            initial_state: AgentState = {
                "messages": [{"role": "user", "content": request.message}],
                "user_id": user_id,
                "context": "",
                "current_agent": "orchestrator",
                "discovery_complete": False,
                "selected_mentor": None,
                "user_situation": ""
            }

        print("[CHAT] Running through LangGraph...")
        # Run through the graph (using ainvoke for async nodes)
        result = await council_graph.ainvoke(initial_state)

        print(f"[CHAT] LangGraph completed. Messages: {len(result['messages'])}")

        # Save conversation state
        conversation_states[user_id] = {
            "messages": result["messages"],
            "context": result.get("context", ""),
            "discovery_complete": result.get("discovery_complete", False),
            "selected_mentor": result.get("selected_mentor"),
            "user_situation": result.get("user_situation", "")
        }

        # Extract the assistant's response
        if len(result["messages"]) > 0:
            # Find the last assistant message
            assistant_message = None
            for msg in reversed(result["messages"]):
                if msg["role"] == "assistant":
                    assistant_message = msg
                    break

            if assistant_message:
                print(f"[CHAT] Response from {result['current_agent']}: {assistant_message['content'][:50]}...")

                # Include persona info if available
                agent_info = result["current_agent"]
                if "persona" in assistant_message:
                    agent_info = f"{result['current_agent']}:{assistant_message['persona']}"

                return ChatResponse(
                    message=ChatMessage(
                        role=assistant_message["role"],
                        content=assistant_message["content"],
                        agent=agent_info
                    ),
                    agent=agent_info
                )
            else:
                raise Exception("No assistant response found")
        else:
            raise Exception("No response from agent")

    except Exception as e:
        print(f"[CHAT ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.post("/reset")
async def reset_conversation(user_id: str = DEMO_USER_ID):
    """Reset the conversation state for a user"""
    if user_id in conversation_states:
        del conversation_states[user_id]
    return {"status": "ok", "message": "Conversation reset"}
