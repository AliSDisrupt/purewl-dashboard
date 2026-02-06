# Restore point: Atlas chat UI (before visual improvements)

If you need to revert the Atlas chat interface to its state before the visual improvements, copy these files back over the current ones:

- `ChatInterface.tsx` → `components/agent/ChatInterface.tsx`
- `ChatMessage.tsx` → `components/agent/ChatMessage.tsx`
- `ChatInput.tsx` → `components/agent/ChatInput.tsx`
- `ThinkingStatus.tsx` → `components/agent/ThinkingStatus.tsx`
- `AgentPopup.tsx` → `components/agent/AgentPopup.tsx`
- `AssistantMarkdown.tsx` → `components/agent/AssistantMarkdown.tsx`

You can delete this `_restore_point_atlas_chat_ui` folder after you're happy with the new UI.
