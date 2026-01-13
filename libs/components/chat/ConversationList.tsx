import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Avatar,
  Badge,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useRouter } from "next/router";
import { GET_CONVERSATIONS } from "@/apollo/user/query";
import { ChatConversation } from "@/libs/types/chat/chat";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { getImageUrl } from "@/libs/imageHelper";
import { io, Socket } from "socket.io-client";
import { getJwtToken, refreshTokens } from "@/libs/auth";
import jwtDecode from "jwt-decode";
import { ChatPresence } from "@/libs/types/chat/chat";

const ConversationList: React.FC = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const { data, loading } = useQuery(GET_CONVERSATIONS, {
    fetchPolicy: "cache-and-network",
  });
  const socketRef = useRef<Socket | null>(null);
  const [presenceMap, setPresenceMap] = useState<Record<string, ChatPresence>>({});

  const conversations = useMemo(
    () => (data?.getConversations ?? []) as ChatConversation[],
    [data],
  );

  useEffect(() => {
    if (!user?._id || !conversations.length) return;
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

      const handlePresence = (payload: {
        conversationId?: string | any;
        doctorOnline?: boolean;
        patientOnline?: boolean;
      }) => {
        if (!payload?.conversationId) return;
        setPresenceMap((prev) => ({
          ...prev,
          [payload.conversationId]: {
            doctorOnline: Boolean(payload.doctorOnline),
            patientOnline: Boolean(payload.patientOnline),
          },
        }));
      };

      socket.on("connect", () => {
        conversations.forEach((conversation) => {
          socket.emit("chat:join", { conversationId: conversation._id });
        });
      });
      socket.on("chat:presence", handlePresence);

      (socketRef.current as any).__cleanup = () => {
        conversations.forEach((conversation) => {
          socket.emit("chat:leave", { conversationId: conversation._id });
        });
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
  }, [conversations, user?._id]);

  if (loading) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          height: "100%",
          minHeight: 520,
          border: "1px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(37, 99, 235, 0.12)",
        }}
      >
        <Stack spacing={2} sx={{ px: 3 }}>
          {[0, 1, 2, 3, 4].map((index) => (
            <Stack key={`conversation-skeleton-${index}`} direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={44} height={44} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" />
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    );
  }

  if (!conversations.length) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          height: "100%",
          minHeight: 520,
          border: "1px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(37, 99, 235, 0.12)",
        }}
      >
        <Typography>No conversations yet.</Typography>
      </Box>
    );
  }

  return (
    <List
      sx={{
        border: "1px solid",
        borderColor: "primary.main",
        borderRadius: 2,
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
        boxShadow: "0 8px 24px rgba(37, 99, 235, 0.12)",
      }}
    >
      {conversations.map((conversation) => {
        const isDoctor = conversation.doctorId === user?._id;
        const other = isDoctor ? conversation.patient : conversation.doctor;
        const otherName =
          other?.memberFullName || other?.memberNick || (isDoctor ? "Patient" : "Doctor");
        const otherImage = other?.memberImage
          ? getImageUrl(other.memberImage)
          : "/images/users/defaultUser.svg";
        const presence = presenceMap[conversation._id];
        const otherOnline = isDoctor
          ? Boolean(presence?.patientOnline)
          : Boolean(presence?.doctorOnline);
        const isActive = router.query.conversationId === conversation._id;
        const unread = conversation.unreadCount ?? 0;
        const subtitle = conversation.lastMessageText || "No messages yet";
        return (
          <ListItemButton
            key={conversation._id}
            onClick={() => router.push(`/chat/${conversation._id}`)}
            sx={{
              borderBottom: "1px solid #f1f5f9",
              borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
              backgroundColor: isActive ? "#f0f5ff" : "transparent",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Avatar src={otherImage} alt={otherName} />
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 600 }}>{otherName}</Typography>
                    {otherOnline && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#16a34a",
                        }}
                      />
                    )}
                  </Stack>
                }
                secondary={subtitle}
              />
            </Stack>
            {unread > 0 && <Badge color="primary" badgeContent={unread} />}
          </ListItemButton>
        );
      })}
    </List>
  );
};

export default ConversationList;
