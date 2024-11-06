import React, { useEffect, useRef, useReducer } from "react";
import AttachmentIcon from '@mui/icons-material/Attachment';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import socket from "../../socket-client";
import { sendMessage } from "../../lib/api";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";


const chatFooterReducer = (state, action) => {
    switch (action.type) {
        case "SET_NEW_MESSAGE":
            return {...state, newMessage: action.payload};
        case "ADD_FILE":
            return {...state, selectedFile: action.payload};
        case "SET_FILE_TYPE":
            return {...state, fileType: action.payload};
        case "SET_SENDING_MESSAGE":
            return {...state, sendingMessage: action.payload};
        default:
            break;
    }
}

const ChatFooter = ({ receiver, setMessages, scrollToBottom, groupId }) => {
    const [state, dispatch ] = useReducer(chatFooterReducer, {newMessage: "", selectedFile: null, fileType: "", sendingMessage: false})
    const handleMessage = useRef(null);
    const typingTimerRef = useRef(null);
    const fileLabelRef = useRef(null);

    useEffect(() => {
        handleMessage.current = (message) => {
            setMessages((prevMessages) => {
                if (message.type === "group" && message.group._id === groupId) {
                    return [...prevMessages, message];
                } else if (message.type === "private" && (message.sender._id === receiver || message.receiver._id === receiver)) {
                    return [...prevMessages, message];
                } else {
                    return prevMessages;
                }

            });
            scrollToBottom();
        };

        socket.on("private-message", handleMessage.current);
        socket.on("group-message", handleMessage.current);


        return () => {
            dispatch({type: "SET_NEW_MESSAGE", payload: ""});
            socket.off("private-message", handleMessage.current);
            socket.off("group-message", handleMessage.current);
            clearTimeout(typingTimerRef.current);
        };
    }, [setMessages, scrollToBottom, groupId, receiver]);

    const handleSendMessage = async () => {
        console.log(state.newMessage, receiver, groupId);
        if (state.sendingMessage) return; // Prevent multiple sends
        dispatch({type: "SET_SENDING_MESSAGE", payload: true});

        try {
            const formData = new FormData();
            formData.append("text", state.newMessage);
            formData.append("receiverId", receiver);
            formData.append("groupId", groupId);
            if (state.selectedFile) {
                formData.append("file", state.selectedFile);
            };
            // console.log(formData);
            await sendMessage(formData);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            dispatch({type: "SET_SENDING_MESSAGE", payload: false});
        }
    };

    const handleTyping = () => {
        socket.emit("typing", { receiverId: receiver });

        clearTimeout(typingTimerRef.current);

        typingTimerRef.current = setTimeout(() => {
            socket.emit("stop-typing", { receiverId: receiver });
        }, 3000);
    }

    const handleClick = e => {
        switch (e.target.innerText) {
            case "Document":
                dispatch({type: "SET_FILE_TYPE", payload: "application/*"});
                break;
            case "Music":
                dispatch({type: "SET_FILE_TYPE", payload: "audio/*"});;
                break;
            case "Video":
                dispatch({type: "SET_FILE_TYPE", payload: "video/*"});
                break;
            case "Picture":
                dispatch({type: "SET_FILE_TYPE", payload: "image/*"});
                break;
            default:
                break;
        }
        fileLabelRef.current.classList.add("hidden")
    }

    return (
        <div className="chat-footer" style={{ position: "relative" }}>
            <label htmlFor="file-attachment" ref={fileLabelRef} className="hidden" style={{ position: "absolute", bottom: "60px", left: "10px" }}>
                <List dense onClick={handleClick} sx={{
                    backgroundColor: 'grey.800',
                    '& .MuiListItemIcon-root': {
                        color: '#fff'
                    }
                }}>
                    <ListItem>
                        <ListItemIcon> <AudioFileIcon /> </ListItemIcon>
                        <ListItemText primary="Music" />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon> <VideoFileIcon /> </ListItemIcon>
                        <ListItemText primary="Video" />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon> <ImageIcon /> </ListItemIcon>
                        <ListItemText primary="Picture" />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon> <ArticleIcon /> </ListItemIcon>
                        <ListItemText primary="Document" />
                    </ListItem>
                </List>
            </label>
            <input style={{ display: "none" }} 
                id="file-attachment" type="file" 
                accept={state.fileType}
                onChange={e => dispatch({type: "ADD_FILE", payload: e.target.files[0]})} 
            />
            <AttachmentIcon onClick={() => fileLabelRef.current.classList.toggle("hidden")} />
            <input
                type="text"
                value={state.newMessage}
                onChange={(e) => dispatch({type: "SET_NEW_MESSAGE", payload: e.target.value})}
                onInput={handleTyping}
                placeholder="Type your message"
            />
            <button onClick={handleSendMessage} disabled={state.sendingMessage}>
                {state.sendingMessage ? "Sending..." : "Send"}
            </button>
        </div>
    );
};



export default ChatFooter;