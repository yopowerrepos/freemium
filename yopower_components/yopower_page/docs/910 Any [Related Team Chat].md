# Any (Related Team Chat)

- ✅ Any column type (represents the row)
- ⚠️ No json parameters (the plugin clears `yp_parameters` on save)
- ⚠️ Uses Microsoft Graph on behalf of the current user, the user needs access to Teams chats and the component must be allowed to call `https://graph.microsoft.com`
- Links a Teams group chat to the row. The chat topic is `<table logical name>_<record id>`, so every user opening the same record reaches the same chat.

## Actions

- **Open in Teams** — opens the chat on Teams, creating it (with the current user as owner) when it does not exist yet.
- **View messages** — popover with the last messages, available once the chat exists:
  - send messages, mentioning members with `@`
  - react to messages (👍 ❤️ 😄 😮 😢 😠)
  - search messages
  - list the chat members
- The Teams button is highlighted when the chat has unread messages, and grey when no chat was created for the row yet.
