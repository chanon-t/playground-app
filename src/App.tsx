import Stack from "@mui/material/Stack";
import Navbar from "./components/Navbar";
import {
  Box,
  createTheme,
  Divider,
  IconButton,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function App() {
  const chatContainer = useRef(null);
  const messageEl = useRef(null);
  const [value, setValue] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [messages, setMessages] = useState([]);

  const baseUrl = "https://sekai-ai-dev-4gkakmc5ja-as.a.run.app/api/v1";
  const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhvbHlkZG9nQGdtYWlsLmNvbSIsIm5hbWUiOiJIb2x5IEQgRG9nIiwidXNlcklkIjoiNjQyM2Y2M2NjNjdlZWI5NWEwNjk0NjA2IiwiaWF0IjoxNjgwNDkzNTM4LCJleHAiOjE3MTIwMjk1Mzh9.7j6INshzUqzaiSDBYFq0nbIofauSDJbI9EPqd_mHRZc";

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const chatId = searchParams.get("chatId");

  const handleChange = (event: any) => {
    setValue(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/chats/${chatId}`, {
          headers: {
            Authorization: token,
          },
        });
        if (response.data) {
          const { character, messages } = response.data;
          setCharacterName(character.name);
          setMessages(messages.splice(1));
        }
        // setData(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const theme = createTheme({
    palette: {
      primary: {
        main: "#8879B0",
      },
      secondary: {
        main: "#FBA1A1",
      },
    },
  });

  const scrollToMyRef = () => {
    if (chatContainer) {
      chatContainer.current.scrollTo({
        top:
          chatContainer.current.scrollHeight -
          chatContainer.current.clientHeight,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (messageEl) {
      messageEl.current.addEventListener("DOMNodeInserted", scrollToMyRef);
    }
    scrollToMyRef();
  }, []);

  const sendMessage = () => {
    let aiMessage = {
      role: "assistant",
      content: "Typing...",
    };
    let newMessages = [
      ...messages,
      {
        role: "user",
        content: value.replace("\n", "<br />"),
      },
      aiMessage,
    ];
    setValue("");
    setMessages(newMessages);

    const fetchData = async () => {
      const response = await axios.patch(
        `${baseUrl}/api/v1/chats/${chatId}/messages`,
        {
          content: value,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (response.data) {
        newMessages[newMessages.length - 1].content = response.data.content;
        setMessages([...newMessages]);
      }
    };
    fetchData();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar logoText={characterName} />
        <Box ref={chatContainer} style={{ flex: 1 }} overflow="auto">
          <Stack ref={messageEl} spacing={1} p={2}>
            {messages.map((message, i) => (
              <Stack
                key={i}
                direction="row-reverse"
                spacing={2}
                justifyContent={message.role === "assistant" ? "start" : "end"}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    maxWidth: "60%",
                    borderRadius: 5,
                    bgcolor:
                      message.role === "assistant"
                        ? "info.main"
                        : "secondary.main",
                    color: "#fff",
                  }}
                >
                  <Typography
                    dangerouslySetInnerHTML={{
                      __html: message.content,
                    }}
                  />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Divider />
        <Box>
          <Stack direction="row" p={2} alignItems="flex-end">
            <TextField
              placeholder="Message"
              fullWidth
              multiline
              maxRows={5}
              sx={{
                flexGrow: 1,
                borderRadius: 7,
                "& fieldset": { borderRadius: 7 },
              }}
              value={value}
              onChange={handleChange}
            />
            <Box p={1}>
              <IconButton onClick={sendMessage}>
                <SendIcon />
              </IconButton>
            </Box>
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
