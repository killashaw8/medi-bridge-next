import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { GET_CHAT_MESSAGES, GET_CONVERSATIONS } from "@/apollo/user/query";
import { MESSAGE_ADDED } from "@/apollo/user/subscription";
import { ChatMessage } from "@/libs/types/chat/chat";
import { ChatMessagesInput, MarkChatReadInput, SendChatMessageInput } from "@/libs/types/chat/chat.input";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { getImageUrl } from "@/libs/imageHelper";
import { io, Socket } from "socket.io-client";
import { getJwtToken, refreshTokens } from "@/libs/auth";
import jwtDecode from "jwt-decode";

interface ChatThreadProps {
  conversationId: string;
}

const ChatThread: React.FC<ChatThreadProps> = ({ conversationId }) => {
  const user = useReactiveVar(userVar);
  const [message, setMessage] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messageRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeDateLabel, setActiveDateLabel] = useState("");
  const [presence, setPresence] = useState<{ doctorOnline: boolean; patientOnline: boolean } | null>(
    null,
  );
  const socketRef = useRef<Socket | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuMessageId, setMenuMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const input: ChatMessagesInput = useMemo(
    () => ({
      conversationId,
      page: 1,
      limit: 50,
    }),
    [conversationId],
  );

  const { data, loading, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { input },
    fetchPolicy: "cache-and-network",
  });
  const { data: conversationsData } = useQuery(GET_CONVERSATIONS, {
    fetchPolicy: "cache-and-network",
  });


  const messages = useMemo(() => {
    const list = (data?.getChatMessages?.list ?? []) as ChatMessage[];
    return [...list].reverse();
  }, [data]);

  const messageGroups = useMemo(() => {
    const groups: {
      senderId: string;
      isMine: boolean;
      messages: ChatMessage[];
      showDateSeparator: boolean;
    }[] = [];

    messages.forEach((msg, index) => {
      const prev = messages[index - 1];
      const sameSender = prev && prev.senderId === msg.senderId;
      const currentDate = new Date(msg.createdAt).toDateString();
      const prevDate = prev ? new Date(prev.createdAt).toDateString() : "";
      const sameDate = currentDate === prevDate;

      if (!sameSender || !sameDate) {
        groups.push({
          senderId: msg.senderId,
          isMine: msg.senderId === user?._id,
          messages: [msg],
          showDateSeparator: currentDate !== prevDate,
        });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [messages, user?._id]);

  const conversation = useMemo(() => {
    const list = conversationsData?.getConversations ?? [];
    return list.find((item: { _id: string }) => item._id === conversationId);
  }, [conversationsData, conversationId]);

  const isDoctor = conversation?.doctorId === user?._id;
  const other = isDoctor ? conversation?.patient : conversation?.doctor;
  const otherName =
    other?.memberFullName || other?.memberNick || (isDoctor ? "Patient" : "Doctor");
  const otherImage = other?.memberImage
    ? getImageUrl(other.memberImage)
    : "/images/users/defaultUser.svg";
  const avatarSx = { width: 38, height: 38, border: "1px solid #e2e8f0" };

  const otherOnline = isDoctor ? Boolean(presence?.patientOnline) : Boolean(presence?.doctorOnline);

  useEffect(() => {
    if (!conversationId || !user?._id) return;
    let cancelled = false;

    const connect = async () => {
      let token = getJwtToken();
      if (token === "undefined" || token === "null") token = "";
      if (!token) return;
      token = token.replace(/^Bearer\s+/i, "");
      if (token.split(".").length !== 3) return;
      try {
        const { exp } = jwtDecode<{ exp?: number }>(token);
        if (exp && Date.now() >= exp * 1000) {
          token = await refreshTokens();
        }
      } catch {
        try {
          token = await refreshTokens();
        } catch {
          return;
        }
      }
      if (!token) return;
      token = token.replace(/^Bearer\s+/i, "");
      if (token.split(".").length !== 3) return;
      if (cancelled) return;

      const socketUrl =
        process.env.NEXT_PUBLIC_API_SOCKET ??
        process.env.NEXT_PUBLIC_API_URL ??
        process.env.REACT_APP_API_URL ??
        "http://localhost:5885";
      const socket = io(socketUrl, {
        auth: { token },
        query: { token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      const handleMessage = (payload: { message?: { conversationId?: string } }) => {
        if (!payload?.message?.conversationId) return;
        if (payload.message.conversationId !== conversationId) return;
        void refetch();
        socket.emit("chat:markRead", { conversationId });
      };
      const handleRead = (payload: { conversationId?: string }) => {
        if (payload?.conversationId !== conversationId) return;
        void refetch();
      };
      const handlePresence = (payload: {
        conversationId?: string;
        doctorOnline?: boolean;
        patientOnline?: boolean;
      }) => {
        if (payload?.conversationId !== conversationId) return;
        setPresence({
          doctorOnline: Boolean(payload.doctorOnline),
          patientOnline: Boolean(payload.patientOnline),
        });
      };

      socket.on("connect", () => {
        socket.emit("chat:join", { conversationId });
        socket.emit("chat:markRead", { conversationId });
      });
      socket.on("chat:message", handleMessage);
      socket.on("chat:read", handleRead);
      socket.on("chat:presence", handlePresence);

      (socketRef.current as any).__cleanup = () => {
        socket.emit("chat:leave", { conversationId });
        socket.off("chat:message", handleMessage);
        socket.off("chat:read", handleRead);
        socket.off("chat:presence", handlePresence);
        socket.disconnect();
      };
    };

    void connect();

    return () => {
      cancelled = true;
      const cleanup = (socketRef.current as any)?.__cleanup;
      if (cleanup) cleanup();
      socketRef.current = null;
    };
  }, [conversationId, refetch, user?._id]);

  useEffect(() => {
    if (!conversationId) return;
    socketRef.current?.emit("chat:markRead", { conversationId });
  }, [conversationId, messages.length]);

  // Presence now comes from WS connect/disconnect; no client ping needed.

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const socket = socketRef.current;
    if (editingMessageId) {
      socket?.emit("chat:edit", { messageId: editingMessageId, content: trimmed });
      setEditingMessageId(null);
    } else {
      socket?.emit("chat:send", { conversationId, content: trimmed });
    }
    setMessage("");
    inputRef.current?.focus();
  };

  const openMenu = (event: React.MouseEvent<HTMLElement>, messageId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuMessageId(messageId);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuMessageId(null);
  };

  const handleEdit = (content: string) => {
    setEditingMessageId(menuMessageId);
    setMessage(content);
    closeMenu();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setMessage("");
    inputRef.current?.focus();
  };

  const handleDelete = async () => {
    if (!menuMessageId) return;
    const confirmed = window.confirm("Delete this message for everyone?");
    if (!confirmed) return;
    socketRef.current?.emit("chat:delete", { messageId: menuMessageId });
    closeMenu();
  };

  const formatMessageTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatMessageDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (!messages.length) {
      setActiveDateLabel("");
      return;
    }
    setActiveDateLabel(formatMessageDate(messages[0].createdAt));
  }, [messages]);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      let currentLabel = activeDateLabel;
      for (let i = 0; i < messageRowRefs.current.length; i += 1) {
        const el = messageRowRefs.current[i];
        if (!el) continue;
        if (el.offsetTop - 8 <= scrollTop) {
          const msg = messages[i];
          if (msg) {
            currentLabel = formatMessageDate(msg.createdAt);
          }
        } else {
          break;
        }
      }
      if (currentLabel !== activeDateLabel) {
        setActiveDateLabel(currentLabel);
      }
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [messages, activeDateLabel]);

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={44} height={44} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="25%" />
            </Box>
          </Stack>
          <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 2, alignSelf: "flex-end", width: "70%" }} />
          <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 2, width: "60%" }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Stack
      spacing={2}
      sx={{
        border: "1px solid",
        borderColor: "primary.main",
        borderRadius: 2,
        p: 2,
        height: "100%",
        minHeight: 520,
        boxShadow: "0 8px 24px rgba(37, 99, 235, 0.12)",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar src={otherImage} alt={otherName} sx={avatarSx} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {otherName}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: otherOnline ? "#16a34a" : "#94a3b8",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {otherOnline ? "Online" : "Offline"}
            </Typography>
          </Stack>
        </Box>
      </Stack>
      <Divider sx={{ borderColor: "primary.main" }} />
      <Stack
        ref={listRef}
        spacing={1.5}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pr: 1,
          position: "relative",
        }}
      >
        {activeDateLabel && (
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              display: "flex",
              justifyContent: "center",
              py: 1,
              background: "linear-gradient(to bottom, #ffffff 60%, rgba(255,255,255,0))",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 999,
                backgroundColor: "#eef1f6",
                color: "#475569",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {activeDateLabel}
            </Box>
          </Box>
        )}
        {messages.length === 0 ? (
          <Typography color="text.secondary">No messages yet.</Typography>
        ) : (
          messageGroups.map((group, index) => {
            const lastMessage = group.messages[group.messages.length - 1];
            const sender =
              group.senderId === conversation?.doctorId
                ? conversation?.doctor
                : conversation?.patient;
            const senderName =
              group.isMine ? "You" : sender?.memberFullName || sender?.memberNick || "Member";
            const senderImage = sender?.memberImage
              ? getImageUrl(sender.memberImage)
              : "/images/users/defaultUser.svg";
            const otherMemberId = group.isMine
              ? isDoctor
                ? conversation?.patientId
                : conversation?.doctorId
              : null;

            return (
              <Stack
                key={`${group.senderId}-${lastMessage._id}`}
                spacing={1}
                sx={{ width: "100%" }}
                ref={(el) => {
                  messageRowRefs.current[index] = el;
                }}
              >
                {group.showDateSeparator && !activeDateLabel && (
                  <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 999,
                        backgroundColor: "#eef1f6",
                        color: "#475569",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {formatMessageDate(lastMessage.createdAt)}
                    </Box>
                  </Box>
                )}
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-end"
                  justifyContent={group.isMine ? "flex-end" : "flex-start"}
                  sx={{ width: "100%", position: "relative" }}
                >
                  {!group.isMine && (
                    <Box sx={{ position: "sticky", bottom: 0, alignSelf: "flex-end" }}>
                      <Avatar src={senderImage} alt={senderName} sx={avatarSx} />
                    </Box>
                  )}
                  <Stack spacing={1} sx={{ maxWidth: "70%" }}>
                    {group.messages.map((msg) => (
                      <Box
                        key={msg._id}
                        sx={{
                          backgroundColor: group.isMine ? "primary.main" : "#f1f5f9",
                          color: group.isMine ? "#fff" : "#111827",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          minHeight: 36,
                          maxWidth: "100%",
                          boxShadow: group.isMine ? "none" : "0 1px 4px rgba(15, 23, 42, 0.08)",
                          position: "relative",
                          display: "flex",
                          alignItems: "flex-end",
                          gap: 1,
                          pr: group.isMine && !msg.isDeleted ? 4 : 2,
                        }}
                      >
                        <Box sx={{ flex: 1, fontStyle: msg.isDeleted ? "italic" : "normal" }}>
                          {msg.isDeleted ? "Message deleted" : msg.content}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            whiteSpace: "nowrap",
                            color: group.isMine ? "rgba(255,255,255,0.75)" : "#64748b",
                            fontSize: 11,
                            fontFamily: '"Calibri", "Segoe UI", Arial, sans-serif',
                            fontStyle: "italic",
                            lineHeight: 1.2,
                            letterSpacing: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {formatMessageTime(msg.createdAt)}
                          {group.isMine && !msg.isDeleted && (
                            msg.readBy?.includes(otherMemberId || "")
                              ? <DoneAllIcon sx={{ fontSize: 14 }} />
                              : <DoneIcon sx={{ fontSize: 14 }} />
                          )}
                          {msg.editedAt && !msg.isDeleted ? " • edited" : ""}
                        </Typography>
                        {group.isMine && !msg.isDeleted && (
                          <IconButton
                            size="small"
                            onClick={(event) => openMenu(event, msg._id)}
                            sx={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              p: 0.25,
                              color: "rgba(255,255,255,0.75)",
                              "&:hover": { color: "#fff" },
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Stack>
                  {group.isMine && (
                    <Box sx={{ position: "sticky", bottom: 0, alignSelf: "flex-end" }}>
                      <Avatar src={senderImage} alt={senderName} sx={avatarSx} />
                    </Box>
                  )}
                </Stack>
              </Stack>
            );
          })
        )}
      </Stack>
      <TextField
        inputRef={inputRef}
        fullWidth
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
          }
        }}
        placeholder="Type a message..."
        autoFocus
        multiline
        minRows={1}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            paddingRight: 0,
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {editingMessageId && (
                <Tooltip title="Cancel edit">
                  <IconButton
                    aria-label="Cancel edit"
                    onClick={handleCancelEdit}
                    sx={{
                      borderRadius: 2,
                      color: "#94a3b8",
                      mr: 0.5,
                      "&:hover": {
                        backgroundColor: "#e2e8f0",
                        color: "#475569",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton
                aria-label="Send"
                onClick={handleSend}
                disabled={!message.trim()}
                sx={{
                  borderRadius: 2,
                  color: "#2563eb",
                  mr: 1,
                  "&:hover": {
                    backgroundColor: "#2563eb",
                    color: "#fff",
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            const msg = messages.find((item) => item._id === menuMessageId);
            handleEdit(msg?.content ?? "");
          }}
        >
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </Stack>
  );
};

export default ChatThread;
