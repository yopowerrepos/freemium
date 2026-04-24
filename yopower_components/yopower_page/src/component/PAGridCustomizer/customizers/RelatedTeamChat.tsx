import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { Button, Spinner, FluentProvider, IdPrefixProvider, webLightTheme, PopoverTrigger, PopoverSurface, Popover, Input, Tooltip } from "@fluentui/react-components";
import { Icon, Stack, Text } from "@fluentui/react";
import { useMemo } from "react";
import { GraphApiClient, Chat, TeamsMessage, ChatMember, ChatMessageReaction } from "../graphApi";

// The 6 Teams-supported reaction emojis
const TEAMS_REACTIONS: string[] = ['👍', '❤️', '😄', '😮', '😢', '😠'];

export const RelatedTeamChat: React.FC<ICell> = (cell) => {

    const graphClient = useMemo(() => new GraphApiClient(cell.context), [cell.context]);
    const chatTopic = `${cell.table}_${cell.id}`;

    const [chat, setChat] = React.useState<Chat | null>(null);
    const [messages, setMessages] = React.useState<TeamsMessage[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [newMessage, setNewMessage] = React.useState<string>("");
    const [sending, setSending] = React.useState<boolean>(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const [members, setMembers] = React.useState<ChatMember[]>([]);
    const [showMembers, setShowMembers] = React.useState<boolean>(false);
    const [showMentionSuggestions, setShowMentionSuggestions] = React.useState<boolean>(false);
    const [mentionFilter, setMentionFilter] = React.useState<string>("");
    const [selectedMentions, setSelectedMentions] = React.useState<{ id: number; mentionText: string; userId: string; displayName: string }[]>([]);
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [currentMatchIndex, setCurrentMatchIndex] = React.useState<number>(0);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
    const [pendingMessages, setPendingMessages] = React.useState<TeamsMessage[]>([]);
    const [hasUnreadMessages, setHasUnreadMessages] = React.useState<boolean>(false);
    const [lastKnownMessageId, setLastKnownMessageId] = React.useState<string | null>(null);
    const [lastKnownReactionsHash, setLastKnownReactionsHash] = React.useState<string | null>(null);
    const [hoveredMessageId, setHoveredMessageId] = React.useState<string | null>(null);
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const matchRefs = React.useRef<(HTMLDivElement | null)[]>([]);

    React.useEffect(() => {
        const fetchChat = async () => {
            setLoading(true);
            try {
                const result = await graphClient.getChatByTopic(chatTopic);
                setChat(result);
                const messages = result ? await graphClient.getChatMessages(result.id, 1) : [];
                setMessages(messages);
                // Initialize lastKnownMessageId to track new messages
                if (messages.length > 0) {
                    setLastKnownMessageId(messages[0]?.id || null);
                }
            } catch (error: any) {
                console.error("Error fetching chat:", error);
                setChat(null);
            } finally {
                setLoading(false);
            }
        };
        fetchChat();
    }, [graphClient, chatTopic]);

    React.useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const openTeamsLink = (webUrl: string) => {
        window.open(webUrl, "_blank");
    };

    const handleOpenChat = async () => {
        if (chat !== null && chat?.webUrl) {
            openTeamsLink(chat.webUrl);
        } else {
            const newChat = await graphClient.createGroupChat(chatTopic, (cell.context.userSettings as any).aadObjectId, null);
            setChat(newChat);
            if (newChat?.webUrl) {
                openTeamsLink(newChat.webUrl);
            }
        }
    };

    const chatFound = chat !== null;
    const currentUserId = (cell.context.userSettings as any).aadObjectId;

    const handleRefreshMessages = async () => {
        if (!chat) return;
        try {
            const updatedMessages = await graphClient.getChatMessages(chat.id, 30);
            setMessages(updatedMessages);
            // Update lastKnownMessageId and reactions hash to track new messages/reactions
            if (updatedMessages.length > 0) {
                setLastKnownMessageId(updatedMessages[0]?.id || null);
                setLastKnownReactionsHash(getReactionsHash(updatedMessages));
            }
            // Clear unread indicator when refreshing
            setHasUnreadMessages(false);
            setPendingMessages([]);
            // Also load members if not already loaded
            if (members.length === 0) {
                const chatMembers = await graphClient.getChatMembers(chat.id);
                setMembers(chatMembers);
            }
        } catch (error: any) {
            console.error("Error refreshing messages:", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!chat || !newMessage.trim()) return;
        setSending(true);
        try {
            await graphClient.sendChatMessage(chat.id, newMessage.trim(), selectedMentions.length > 0 ? selectedMentions : undefined);
            setNewMessage("");
            setSelectedMentions([]);
            // handleRefreshMessages updates lastKnownMessageId and reactionsHash to prevent counting sent message as unread
            await handleRefreshMessages();
        } catch (error: any) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>, data: { value: string }) => {
        const value = data.value;
        setNewMessage(value);

        // Check for @ symbol to trigger mention suggestions
        const lastAtIndex = value.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const textAfterAt = value.substring(lastAtIndex + 1);
            // Only show suggestions if there's no space after @ (still typing the mention)
            if (!textAfterAt.includes(' ')) {
                setMentionFilter(textAfterAt.toLowerCase());
                setShowMentionSuggestions(true);
                // Ensure members are loaded
                if (members.length === 0) {
                    handleRefreshMembers();
                }
            } else {
                setShowMentionSuggestions(false);
            }
        } else {
            setShowMentionSuggestions(false);
        }
    };

    const handleSelectMention = (member: ChatMember) => {
        const lastAtIndex = newMessage.lastIndexOf('@');
        const beforeAt = newMessage.substring(0, lastAtIndex);
        const newText = `${beforeAt}@${member.displayName} `;
        setNewMessage(newText);
        setSelectedMentions([...selectedMentions, {
            id: selectedMentions.length,
            mentionText: member.displayName,
            userId: member.userId,
            displayName: member.displayName
        }]);
        setShowMentionSuggestions(false);
        inputRef.current?.focus();
    };

    const handleReaction = async (messageId: string, reactionType: string) => {
        if (!chat) return;
        
        // Close hover state immediately
        setHoveredMessageId(null);
        
        try {
            const message = messages.find(m => m.id === messageId);
            const currentUserDisplayName = (cell.context.userSettings as any).userName;
            const hasReacted = message?.reactions?.some(
                r => r.reactionType === reactionType && r.user?.displayName === currentUserDisplayName
            );

            if (hasReacted) {
                await graphClient.unsetReaction(chat.id, messageId, reactionType);
            } else {
                await graphClient.setReaction(chat.id, messageId, reactionType);
            }
        } catch (error: any) {
            console.error("Error setting reaction:", error);
        } finally {
            // Always refresh messages to get updated reactions, regardless of success or error
            try {
                const updatedMessages = await graphClient.getChatMessages(chat.id, 30);
                setMessages(updatedMessages);
                // Update reactions hash to prevent self-reaction triggering unread
                setLastKnownReactionsHash(getReactionsHash(updatedMessages));
            } catch (refreshError: any) {
                console.error("Error refreshing messages after reaction:", refreshError);
            }
        }
    };

    const getReactionSummary = (reactions: ChatMessageReaction[] | undefined) => {
        if (!reactions || reactions.length === 0) return [];
        const summary: { type: string; emoji: string; count: number; users: string[] }[] = [];
        reactions.forEach(r => {
            const existing = summary.find(s => s.type === r.reactionType);
            if (existing) {
                existing.count++;
                existing.users.push(r.user?.displayName || 'Unknown');
            } else {
                summary.push({
                    type: r.reactionType,
                    emoji: r.reactionType,
                    count: 1,
                    users: [r.user?.displayName || 'Unknown']
                });
            }
        });
        return summary;
    };

    const filteredMembers = members.filter(m =>
        m.displayName?.toLowerCase().includes(mentionFilter) ||
        m.email?.toLowerCase().includes(mentionFilter)
    );

    // Get all messages (no filtering, just exclude system messages)
    const displayMessages = messages.filter(m => m.body?.content !== '<systemEventMessage/>');

    // Find all matches for search
    const searchMatches = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const matches: number[] = [];
        displayMessages.forEach((message, index) => {
            const content = message.body?.content?.replace(/<[^>]*>/g, "").toLowerCase() || "";
            if (content.includes(searchQuery.toLowerCase())) {
                matches.push(index);
            }
        });
        return matches;
    }, [displayMessages, searchQuery]);

    // Reset current match when search changes
    React.useEffect(() => {
        setCurrentMatchIndex(0);
    }, [searchQuery]);

    // Scroll to current match
    React.useEffect(() => {
        if (searchMatches.length > 0 && matchRefs.current[searchMatches[currentMatchIndex]]) {
            matchRefs.current[searchMatches[currentMatchIndex]]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [currentMatchIndex, searchMatches]);

    const goToNextMatch = () => {
        if (searchMatches.length > 0) {
            setCurrentMatchIndex((prev) => (prev + 1) % searchMatches.length);
        }
    };

    const goToPrevMatch = () => {
        if (searchMatches.length > 0) {
            setCurrentMatchIndex((prev) => (prev - 1 + searchMatches.length) % searchMatches.length);
        }
    };

    // Highlight search matches in text
    const highlightText = (html: string, isCurrentMatch: boolean) => {
        if (!searchQuery.trim()) return html;
        const plainText = html.replace(/<[^>]*>/g, "");
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const highlighted = plainText.replace(regex, `<mark style="background-color: ${isCurrentMatch ? '#FFA500' : '#FFFF00'}; padding: 0 2px; border-radius: 2px;">$1</mark>`);
        return highlighted;
    };

    const handleOpenInTeams = () => {
        if (chat?.webUrl) {
            window.open(chat.webUrl, '_blank');
        }
    };

    // Helper to generate a hash of reactions for change detection
    const getReactionsHash = (msgs: TeamsMessage[]): string => {
        return msgs.map(m => 
            `${m.id}:${(m.reactions || []).map(r => `${r.reactionType}-${r.user?.displayName}`).sort().join(',')}`
        ).join('|');
    };

    // Polling for new messages when popover is open (every 3 seconds)
    React.useEffect(() => {
        if (!isPopoverOpen || !chat) return;

        const pollMessages = async () => {
            try {
                const updatedMessages = await graphClient.getChatMessages(chat.id, 30);
                // Check if there are new messages by comparing the first message id
                const currentFirstMessageId = messages.length > 0 ? messages[0]?.id : null;
                const newFirstMessageId = updatedMessages.length > 0 ? updatedMessages[0]?.id : null;
                const newReactionsHash = getReactionsHash(updatedMessages);
                
                // Any change from Teams (messages or reactions) should trigger pending messages
                // This includes messages/reactions from current user via Teams app
                const hasNewMessages = currentFirstMessageId !== newFirstMessageId && updatedMessages.length > 0;
                const hasNewReactions = lastKnownReactionsHash && newReactionsHash !== lastKnownReactionsHash;
                
                // Update messages immediately if there are new messages or reactions, but only set pending if change is from Teams (not from current user via this app)
                setMessages(updatedMessages);
                setLastKnownReactionsHash(newReactionsHash);

                // Only show pending messages if user is not already at the bottom of the chat
                if (hasNewMessages || hasNewReactions) {
                    const messagesContainer = messagesEndRef.current?.parentElement;
                    const isAtBottom = messagesContainer 
                        ? Math.abs(messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight) < 50
                        : false;
                    
                    if (!isAtBottom) {
                        setPendingMessages(updatedMessages);
                        setHasUnreadMessages(true);
                    } else {
                        // User is at bottom, just update messages without pending notification
                        setLastKnownMessageId(newFirstMessageId);
                    }
                }
            } catch (error: any) {
                console.error("Error polling messages:", error);
            }
        };

        // Poll every 3 seconds when popover is open
        const intervalId = setInterval(pollMessages, 3000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isPopoverOpen, chat, graphClient, messages, lastKnownReactionsHash]);

    // Background polling when popover is closed (every 5 seconds)
    React.useEffect(() => {
        if (isPopoverOpen || !chat) return;

        const backgroundPoll = async () => {
            try {
                const updatedMessages = await graphClient.getChatMessages(chat.id, 1);
                const newFirstMessageId = updatedMessages.length > 0 ? updatedMessages[0]?.id : null;
                const compareId = lastKnownMessageId || (messages.length > 0 ? messages[0]?.id : null);
                const newReactionsHash = getReactionsHash(updatedMessages);
                
                // Check if there's a new message or new reactions from Teams
                // Consider all external activity as unread (including from current user via Teams app)
                const hasNewMessages = newFirstMessageId && newFirstMessageId !== compareId;
                const hasNewReactions = lastKnownReactionsHash && newReactionsHash !== lastKnownReactionsHash;
                
                if (hasNewMessages || hasNewReactions) {
                    setHasUnreadMessages(true);
                    setPendingMessages(updatedMessages);
                }
            } catch (error: any) {
                console.error("Error background polling:", error);
            }
        };

        // Poll every 5 seconds when popover is closed
        const intervalId = setInterval(backgroundPoll, 9000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isPopoverOpen, chat, graphClient, messages, lastKnownMessageId, lastKnownReactionsHash]);

    const handleShowNewMessages = () => {
        if (pendingMessages.length > 0) {
            setMessages(pendingMessages);
            setPendingMessages([]);
            setHasUnreadMessages(false);
            // Update last known message ID and reactions hash
            if (pendingMessages.length > 0) {
                setLastKnownMessageId(pendingMessages[0]?.id || null);
                setLastKnownReactionsHash(getReactionsHash(pendingMessages));
            }
            // Scroll to bottom after update
            setTimeout(() => scrollToBottom(), 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleRefreshMembers = async () => {
        if (!chat) return;
        try {
            const chatMembers = await graphClient.getChatMembers(chat.id);
            setMembers(chatMembers);
        } catch (error: any) {
            console.error("Error fetching members:", error);
        }
    };

    const toggleMembersView = () => {
        if (!showMembers) {
            handleRefreshMembers();
        }
        setShowMembers(!showMembers);
    };

    return (
        <div
            style={{
                borderRadius: 2,
                textAlign: "center",
                lineHeight: "20px",
                display: "flex",
                alignItems: "center",
                margin: "4px",
                gap: 4,
                background: "#F1F1F1"
            }}>
            <div style={{ position: "relative" }}>
                <Button
                    title="Open in Teams"
                    appearance="primary"
                    icon={loading ? <Spinner size="tiny" /> : <Icon iconName="TeamsLogo" />}
                    onClick={handleOpenChat}
                    disabled={loading}
                    style={{
                        minWidth: "auto",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        color: hasUnreadMessages ? "#FFA500" : chatFound ? "#572EFF" : "#C4C4C4",
                        background: hasUnreadMessages ? "#FFF8E1" : "#F1F1F1"
                    }}
                />
            </div>
            <IdPrefixProvider value={`${cell.table}-${cell.id}-chat`}>
                <FluentProvider theme={webLightTheme}>
                    <Popover withArrow onOpenChange={(e, data) => setIsPopoverOpen(data.open)}>
                        <PopoverTrigger disableButtonEnhancement>
                            <div style={{ position: "relative" }}>
                                <Button
                                    size="small"
                                    title="View messages"
                                    appearance="primary"
                                    icon={<Icon iconName="SkypeMessage" style={{ fontSize: 14 }} />}
                                    onClick={handleRefreshMessages}
                                    disabled={loading || !chatFound}
                                    style={{
                                        minWidth: "auto",
                                        padding: "4px 8px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        color: hasUnreadMessages ? "#FFA500" : chatFound ? "#572EFF" : "#C4C4C4",
                                        background: hasUnreadMessages ? "#FFF8E1" : "#F1F1F1"
                                    }}
                                />
                            </div>
                        </PopoverTrigger>
                        <PopoverSurface tabIndex={-1} style={{ width: 500, height: 500, display: "flex", flexDirection: "column", padding: 0 }}>
                            <div style={{ padding: "12px 12px 8px 12px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Text variant="large" style={{ fontWeight: 600 }}>
                                    {showMembers ? "Chat Members" : "Chat Messages"}
                                </Text>
                                <Tooltip content={showMembers ? "View Messages" : `View Members (${members.length})`} relationship="label">
                                    <Button
                                        size="small"
                                        appearance="subtle"
                                        icon={<Icon iconName={showMembers ? "Chat" : "People"} style={{ fontSize: 16 }} />}
                                        onClick={toggleMembersView}
                                        style={{ minWidth: "auto", padding: "4px 8px" }}
                                    />
                                </Tooltip>
                            </div>

                            {showMembers ? (
                                <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column" }}>
                                    {/* Disclaimer */}
                                    <div style={{
                                        backgroundColor: "#FFF4CE",
                                        border: "1px solid #FFE082",
                                        borderRadius: 4,
                                        padding: "8px 12px",
                                        marginBottom: 12,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8
                                    }}>
                                        <Icon iconName="Info" style={{ color: "#B8860B", fontSize: 16 }} />
                                        <Text variant="small" style={{ color: "#5D4E37" }}>
                                            Not is possible manage users using embedded chat.
                                        </Text>
                                    </div>
                                    {/* Current Members List */}
                                    <Text variant="smallPlus" style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>
                                        Members ({members.length})
                                    </Text>
                                    {members.length > 0 ? members.map((member, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: "8px 12px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 12,
                                                backgroundColor: member.userId === currentUserId ? "#F5F5F5" : "transparent",
                                                borderRadius: 4,
                                                marginBottom: 4
                                            }}
                                        >
                                            <div style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: "50%",
                                                backgroundColor: "#5B5FC7",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#FFFFFF",
                                                fontSize: 14,
                                                fontWeight: 600
                                            }}>
                                                {member.displayName?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <Text variant="smallPlus" style={{ display: "block" }}>
                                                    {member.displayName}
                                                    {member.userId === currentUserId && <span style={{ color: "#616161", marginLeft: 4 }}>(You)</span>}
                                                </Text>
                                                <Text variant="tiny" style={{ color: "#616161" }}>{member.email}</Text>
                                            </div>
                                            {member.roles?.includes("owner") && (
                                                <Text variant="tiny" style={{ color: "#5B5FC7", fontWeight: 600 }}>Owner</Text>
                                            )}
                                        </div>
                                    )) : (
                                        <Text>No members found</Text>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Search bar with navigation */}
                                    <div style={{ padding: "8px 12px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 8 }}>
                                        <Input
                                            placeholder="Search messages..."
                                            value={searchQuery}
                                            onChange={(e, data) => setSearchQuery(data.value)}
                                            contentBefore={<Icon iconName="Search" style={{ fontSize: 12, color: "#666" }} />}
                                            style={{ flex: 1 }}
                                            size="small"
                                        />
                                        {searchQuery.trim() && (
                                            <>
                                                <Text variant="tiny" style={{ color: "#666", whiteSpace: "nowrap" }}>
                                                    {searchMatches.length > 0 ? `${currentMatchIndex + 1} of ${searchMatches.length}` : "0 of 0"}
                                                </Text>
                                                <Button
                                                    size="small"
                                                    appearance="subtle"
                                                    icon={<Icon iconName="ChevronUp" style={{ fontSize: 12 }} />}
                                                    onClick={goToPrevMatch}
                                                    disabled={searchMatches.length === 0}
                                                    style={{ minWidth: "auto", padding: "4px" }}
                                                />
                                                <Button
                                                    size="small"
                                                    appearance="subtle"
                                                    icon={<Icon iconName="ChevronDown" style={{ fontSize: 12 }} />}
                                                    onClick={goToNextMatch}
                                                    disabled={searchMatches.length === 0}
                                                    style={{ minWidth: "auto", padding: "4px" }}
                                                />
                                                <Button
                                                    size="small"
                                                    appearance="subtle"
                                                    icon={<Icon iconName="Cancel" style={{ fontSize: 12 }} />}
                                                    onClick={() => setSearchQuery("")}
                                                    style={{ minWidth: "auto", padding: "4px" }}
                                                />
                                            </>
                                        )}
                                    </div>
                                    {/* Disclaimer */}
                                    <div style={{
                                        backgroundColor: "#F0F0F0",
                                        padding: "6px 12px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        borderBottom: "1px solid #eee"
                                    }}>
                                        <Icon iconName="Info" style={{ color: "#666", fontSize: 12 }} />
                                        <Text variant="tiny" style={{ color: "#666" }}>
                                            Only 30 last messages are visible on the chat.
                                        </Text>
                                    </div>
                                    {/* New messages alert */}
                                    {pendingMessages.length > 0 && (
                                        <div 
                                            onClick={handleShowNewMessages}
                                            style={{
                                                backgroundColor: "#5B5FC7",
                                                padding: "8px 12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 8,
                                                cursor: "pointer",
                                                borderBottom: "1px solid #eee"
                                            }}
                                        >
                                            <Icon iconName="Down" style={{ color: "#fff", fontSize: 12 }} />
                                            <Text variant="small" style={{ color: "#fff", fontWeight: 600 }}>
                                                New messages - Click to load
                                            </Text>
                                        </div>
                                    )}
                                    <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px", display: "flex", flexDirection: "column" }}>
                                        {displayMessages.length > 0 ?
                                            [...displayMessages].reverse().map((message, index) => {
                                                const reverseIndex = displayMessages.length - 1 - index;
                                                const isCurrentUser = (message.from?.user as any)?.id === currentUserId;
                                                const isMatch = searchMatches.includes(reverseIndex);
                                                const isCurrentMatch = searchMatches[currentMatchIndex] === reverseIndex;
                                                const reactionSummary = getReactionSummary(message.reactions);
                                                const isHovered = hoveredMessageId === message.id;
                                                return (
                                                    <div
                                                        key={index}
                                                        ref={(el) => { matchRefs.current[reverseIndex] = el; }}
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                                                            marginBottom: reactionSummary.length > 0 ? 16 : 8
                                                        }}
                                                    >
                                                        <div 
                                                            style={{ position: "relative", maxWidth: "80%" }}
                                                            onMouseEnter={() => {
                                                                hoverTimeoutRef.current = setTimeout(() => {
                                                                    setHoveredMessageId(message.id);
                                                                }, 300);
                                                            }}
                                                            onMouseLeave={() => {
                                                                if (hoverTimeoutRef.current) {
                                                                    clearTimeout(hoverTimeoutRef.current);
                                                                    hoverTimeoutRef.current = null;
                                                                }
                                                                setHoveredMessageId(null);
                                                            }}
                                                        >
                                                            <div style={{
                                                                backgroundColor: isCurrentMatch ? "#FFF3CD" : isCurrentUser ? "#5B5FC7" : "#E8E8E8",
                                                                color: isCurrentMatch ? "#242424" : isCurrentUser ? "#FFFFFF" : "#242424",
                                                                borderRadius: isCurrentUser ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                                                                padding: "4px 12px",
                                                                border: isCurrentMatch ? "2px solid #FFA500" : "none"
                                                            }}>
                                                                {!isCurrentUser && (
                                                                    <Text variant="smallPlus" style={{ fontSize: 12, display: "block" }}>
                                                                        {message.from?.user?.displayName || "Unknown"}
                                                                    </Text>
                                                                )}
                                                                <div
                                                                    style={{ fontSize: 12 }}
                                                                    dangerouslySetInnerHTML={{ __html: message.body?.content || "" }}
                                                                />
                                                                <Text variant="tiny" style={{ color: isCurrentMatch ? "#856404" : isCurrentUser ? "rgba(255,255,255,0.7)" : "#616161", display: "block", textAlign: "right" }}>
                                                                    {new Date(message.createdDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </Text>
                                                            </div>
                                                            {/* Reaction Picker - appears on hover, on opposite side of message */}
                                                            {isHovered && (
                                                                <div style={{
                                                                    position: "static",
                                                                    backgroundColor: "#292929",
                                                                    borderRadius: 20,
                                                                    padding: "4px 8px",
                                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                                                    display: "flex",
                                                                    gap: 4,
                                                                    zIndex: 100,
                                                                    maxWidth: 200,
                                                                    alignSelf: isCurrentUser ? "flex-end" : "flex-start"
                                                                }}>
                                                                    {TEAMS_REACTIONS.map((emoji, index) => (
                                                                        <span
                                                                            key={index}
                                                                            onClick={(e) => { e.stopPropagation(); handleReaction(message.id, emoji); }}
                                                                            style={{
                                                                                cursor: "pointer",
                                                                                fontSize: 16,
                                                                                padding: "4px",
                                                                                borderRadius: 6,
                                                                                transition: "transform 0.15s, background 0.15s"
                                                                            }}
                                                                            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                                                                            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "transparent"; }}
                                                                            title={emoji}
                                                                        >
                                                                            {emoji}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {/* Existing Reactions - positioned right below message */}
                                                            {reactionSummary.length > 0 && (
                                                                <div style={{
                                                                    position: "absolute",
                                                                    bottom: -15,
                                                                    right: 0,
                                                                    display: "flex",
                                                                    gap: 2,
                                                                    zIndex: 50
                                                                }}>
                                                                    {reactionSummary.map((r, i) => (
                                                                        <Tooltip key={i} content={r.users.join(", ")} relationship="label">
                                                                            <span
                                                                                onClick={() => handleReaction(message.id, r.type)}
                                                                                style={{
                                                                                    backgroundColor: "#fff",
                                                                                    border: "1px solid #e0e0e0",
                                                                                    borderRadius: 12,
                                                                                    padding: "2px 6px",
                                                                                    fontSize: 12,
                                                                                    cursor: "pointer",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: 3,
                                                                                    boxShadow: "0 1px 4px rgba(0,0,0,0.12)"
                                                                                }}
                                                                            >
                                                                                {r.emoji}
                                                                                {r.count > 1 && <span style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>{r.count}</span>}
                                                                            </span>
                                                                        </Tooltip>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }) : (
                                                <Text>No messages</Text>
                                            )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div style={{ padding: "8px 12px 12px 12px", borderTop: "1px solid #eee", display: "flex", flexDirection: "column", gap: 8 }}>
                                        {/* Mention Suggestions */}
                                        {showMentionSuggestions && filteredMembers.length > 0 && (
                                            <div style={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e0e0e0",
                                                borderRadius: 4,
                                                maxHeight: 150,
                                                overflowY: "auto",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                                            }}>
                                                {filteredMembers.slice(0, 5).map((member, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => handleSelectMention(member)}
                                                        style={{
                                                            padding: "8px 12px",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8,
                                                            backgroundColor: "transparent"
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                                    >
                                                        <div style={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: "50%",
                                                            backgroundColor: "#5B5FC7",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#FFFFFF",
                                                            fontSize: 11,
                                                            fontWeight: 600
                                                        }}>
                                                            {member.displayName?.charAt(0).toUpperCase() || "?"}
                                                        </div>
                                                        <div>
                                                            <Text variant="small" style={{ display: "block" }}>{member.displayName}</Text>
                                                            <Text variant="tiny" style={{ color: "#616161" }}>{member.email}</Text>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div style={{ display: "flex", gap: 8, position: "relative" }}>
                                            <Tooltip content="Open Chat" relationship="label">
                                                <Button
                                                    appearance="subtle"
                                                    icon={<Icon iconName="TeamsLogo" style={{ fontSize: 14 }} />}
                                                    onClick={handleOpenInTeams}
                                                    disabled={!chatFound}
                                                    style={{ minWidth: "auto", padding: "6px 8px" }}
                                                />
                                            </Tooltip>
                                            <Input
                                                ref={inputRef}
                                                placeholder="Type a message... Use @ to mention"
                                                value={newMessage}
                                                onChange={handleInputChange}
                                                onKeyDown={handleKeyDown}
                                                disabled={sending}
                                                style={{ flex: 1 }}
                                            />
                                            <Button
                                                appearance="primary"
                                                icon={sending ? <Spinner size="tiny" /> : <Icon iconName="Send" style={{ fontSize: 14 }} />}
                                                onClick={handleSendMessage}
                                                disabled={sending || !newMessage.trim()}
                                                style={{ minWidth: "auto", padding: "6px 12px" }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </PopoverSurface>
                    </Popover>
                </FluentProvider>
            </IdPrefixProvider>
            {messages.filter(m => m.body?.content !== '<systemEventMessage/>').length > 0 && (
                <span
                    style={{
                        fontSize: 12,
                        color: "#333333",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                        display: "flex",
                        alignItems: "center",
                        textAlign: "left"
                    }}
                    title={messages.filter(m => m.body?.content !== '<systemEventMessage/>')[0].body?.content?.replace(/<[^>]*>/g, "") || ""}
                >
                    {messages.filter(m => m.body?.content !== '<systemEventMessage/>')[0].body?.content?.replace(/<[^>]*>/g, "").substring(0, 50) || ""}
                    {(messages.filter(m => m.body?.content !== '<systemEventMessage/>')[0].body?.content?.length || 0) > 50 ? "..." : ""}
                </span>
            )}
        </div>
    );
};