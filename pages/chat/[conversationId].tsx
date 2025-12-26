import { NextPage } from "next";
import { useRouter } from "next/router";
import ConversationList from "@/libs/components/chat/ConversationList";
import ChatThread from "@/libs/components/chat/ChatThread";
import { Box, Stack } from "@mui/material";
import withLayoutChat from "@/libs/components/layout/LayoutChat";

const ChatThreadPage: NextPage = () => {
  const router = useRouter();
  const conversationId = typeof router.query.conversationId === "string" ? router.query.conversationId : "";

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
            {conversationId && <ChatThread conversationId={conversationId} />}
          </Box>
        </Stack>
      </div>
    </div>
  );
};

export default withLayoutChat(ChatThreadPage);
