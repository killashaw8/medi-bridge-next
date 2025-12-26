import { NextPage } from "next";
import { useEffect } from "react";
import ConversationList from "@/libs/components/chat/ConversationList";
import ChatThread from "@/libs/components/chat/ChatThread";
import { useRouter } from "next/router";
import { Box, Stack, Typography } from "@mui/material";
import { useQuery, useReactiveVar } from "@apollo/client";
import { GET_CONVERSATIONS } from "@/apollo/user/query";
import { userVar } from "@/apollo/store";
import withLayoutChat from "@/libs/components/layout/LayoutChat";

const ChatHome: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const conversationId =
    typeof router.query.conversationId === "string" ? router.query.conversationId : "";
  const { data: conversationsData } = useQuery(GET_CONVERSATIONS, {
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (conversationId) return;
    const conversations = conversationsData?.getConversations ?? [];
    const last = conversations[0];
    if (last?._id) {
      router.replace(`/chat?conversationId=${last._id}`, undefined, { shallow: true });
    }
  }, [conversationId, conversationsData, router]);

  return (
    <div className="doctor-area" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="container">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{
            alignItems: "stretch",
            minHeight: { md: "calc(100vh - 220px)" },
            height: { md: "calc(100vh - 220px)" },
          }}
        >
          <Box sx={{ flex: { md: "0 0 320px" }, width: "100%", height: { md: "100%" } }}>
            <ConversationList />
          </Box>
          <Box sx={{ flex: 1, height: { md: "100%" } }}>
            {conversationId ? (
              <ChatThread conversationId={conversationId} />
            ) : (
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "primary.main",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  height: { md: "100%" },
                  minHeight: 520,
                  boxShadow: "0 8px 24px rgba(37, 99, 235, 0.12)",
                }}
              >
                <Typography color="text.secondary">
                  Select a conversation to start chatting.
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </div>
    </div>
  );
};

export default withLayoutChat(ChatHome);
