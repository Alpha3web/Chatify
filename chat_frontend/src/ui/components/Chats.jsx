import { useEffect, useRef, useReducer, useCallback } from "react";
import { fetchChats, fetchGroups, } from "../../lib/api";
import { Link, useNavigate } from "react-router-dom"
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Badge, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import socket from "../../socket-client";
import _ from "lodash";
import { green } from "@mui/material/colors";



const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    case 'UPDATE_OR_ADD_CHAT':
      const { text, timestamp, receiver, sender, group, type} = action.payload
      const chatName = receiver?.username || group?.name;
      const _id = receiver?._id || group?._id;
      let isPrevious = false;
      const updatedChats = state.chats.map((chat) => {
        if (chat._id === _id || (chat._id === sender._id && type === "private")) {
          isPrevious = true;
          return { ...chat, lastMessage: text, lastTimestamp: timestamp };
        }
        return chat;
      });
      if (isPrevious) {
        return { ...state, chats: _.orderBy(updatedChats, "lastTimestamp", "desc") };
      } else {
        const newChat = { chatName, _id, lastMessage: text, lastTimestamp: timestamp, type};
        return { ...state, chats: [newChat, ...state.chats] };
      }
    default:
      return state;
  }
};

const Chats = () => {
  const [state, dispatch] = useReducer(chatReducer, { chats: [], groups: [] });
  const navigate = useNavigate();
  const handleSocketMessage = useRef(null);

  const fetchChatsAndUpdate = useCallback(async () => {
    try {
      const prevChats = await fetchChats();
      dispatch({ type: "SET_CHATS", payload: prevChats});
    } catch (error) {
      navigate("/login")
    }

    const groups = await fetchGroups();
    socket.emit("joined-groups", { groups: groups.map(group => group._id) });

  }, [navigate, dispatch]);

  const setupSocket = useCallback(() => {
    handleSocketMessage.current = (message) => {
      dispatch({ type: "UPDATE_OR_ADD_CHAT", payload: message })
    };
    socket.on("private-message", handleSocketMessage.current);
    socket.on("group-message", handleSocketMessage.current);

  }, [dispatch]);

  useEffect(() => {
    fetchChatsAndUpdate();
    setupSocket();

    return () => {
      socket.off('private-message');
    };
  }, [fetchChatsAndUpdate, setupSocket]);

  return (
    <>
      <List sx={{ width: '100%', maxWidth: 360, m: "auto", }}>
        {
          state.chats.map(chat => {
            return (
              <Link key={chat._id} to={`/${chat.type === "private"? "chats": "groups"}/${chat._id}`} >
                <ListItem
                  sx={{
                    m: "3px 0px",
                    borderRadius: "5px",
                    bgcolor: "grey.900",
                    '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)', },
                    '& .MuiListItemText-primary': { color: 'common.white', },
                    '&:hover': { bgcolor: '#616161', },
                  }}
                  secondaryAction={<p style={{ color: "#ffbc00" }}>{chat.lastTimestamp}</p>}>
                  <ListItemAvatar>
                    <Badge variant='dot' color='success' overlap='circular'
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}>
                      <Avatar alt='smart splendid' src='/profile-image.jpg' />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText primary={chat.chatName} secondary={chat.lastMessage} />
                </ListItem>
              </Link>
            )
          })
        }

      </List>
      <Link to="/users">
        <AddIcon fontSize="large" sx={{ bgcolor: green[700], borderRadius: "50%", position: "absolute", bottom: "40px", right: "20px" }} />
      </Link>
    </>
  )
}


export default Chats;