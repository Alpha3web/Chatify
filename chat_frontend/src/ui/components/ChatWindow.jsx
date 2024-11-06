import React, { useState, useEffect } from 'react';
import { fetchUserData, fetchMessageHistory, fetchGroupData, fetchGroupMessages } from '../../lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import ChatFooter from './ChatFooter';
import ChatBody from './ChatBody';
import ChatHeader from './ChatHeader';
import { useRef } from 'react';
import socket from '../../socket-client';

const ChatWindow = () => {
    const { chatId, groupId } = useParams();
    const [user, setUser] = useState({});
    const [groupData, setGroupData] = useState({});
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate()
    const chatContainerRef = useRef(null);
    const handleScroll = () => chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (chatId) {
                    const userData = await fetchUserData(chatId);
                    setUser(userData);
                    setGroupData({});
                    const messageHistory = await fetchMessageHistory(chatId);
                    setMessages(messageHistory);
                } else if (groupId) {
                    const groupData = await fetchGroupData(groupId);
                    setGroupData(groupData);
                    setUser({});
                    const messageHistory = await fetchGroupMessages(groupId);
                    setMessages(messageHistory);
                    // setMessages([]);
                }
            } catch (error) {
                if (error.code === 500) {
                    navigate("/login", { replace: true });
                }
                setError(error.message);
            }
        };
        fetchData();


    }, [chatId, groupId, error, navigate]);

    useEffect(() => {
        socket.on('user-status-update', ({ username, online }) => {
            setUser(prevState => {
                return prevState.username === username ? { ...prevState, online } : prevState;
            });
        });

        return () => {
            socket.off('user-status-update', ({ username, online }) => {
                return;
            });
        };
    }, []);

    return (
        <div className="chat-window">
            {user.username || groupData.name ?
                <>
                    <ChatHeader client={user} groupData={groupData} />
                    <ChatBody messages={messages} receiver={user} groupId={groupData._id} ref={chatContainerRef} />
                    <ChatFooter
                        receiver={chatId}
                        groupId={groupData._id}
                        setMessages={setMessages}
                        scrollToBottom={handleScroll}
                    />
                </> :
                <p>Click a message to display</p>
            }
        </div>
    );

};

export default ChatWindow;