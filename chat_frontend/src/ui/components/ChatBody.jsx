import { forwardRef, useEffect, useState } from "react";
import socket from "../../socket-client";

export default forwardRef(
    function ChatBody({ messages, receiver, groupId }, ref) {
        const [isTyping, setIsTyping] = useState(false);
        const [currentUserId, setCurrentUserId] = useState("");

        useEffect(() => {
            socket.emit("currentUser", null, ({ currentUserId }) => setCurrentUserId(currentUserId));

            socket.on("user-typing", (user) => {
                setIsTyping(true);
            });
            socket.on("user-stop-typing", (user) => {
                setIsTyping(false);
            });
            return () => {
                socket.off("user-typing");
            };
        }, []);

        const handleFileDownload = (file) => {
            // Validate file type
            const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
            if (!allowedTypes.includes(file.mimetype)) {
                alert("File type not allowed");
                return;
            }
            // Create anchor tag with href attribute set to file path and download attribute
            const anchor = document.createElement("a");
            anchor.href = file.path;
            anchor.download = file.filename;
            anchor.click();
        };

        const getMessageFileIcon = (mimetype) => {
            switch (mimetype.split("/")[0]) {
                case "application":
                    return "file-text";
                case "audio":
                    return "file-audio";
                case "video":
                    return "file-video";
                default:
                    return "file";
            }
        };

        return (
            <div className="chat-body" ref={ref}>
                {messages.map((message) => (
                    <div key={message._id} className={`message ${message.sender._id === currentUserId ? "sent" : "received"}`}>
                        {message.type === "group" && message.sender._id !== currentUserId && (
                            <p>{message.sender.username}</p>
                        )}
                        {message.file && (
                            <div style={{position: "relative"}}>
                                {/* File Icon or Thumbnail */}
                                {message.file.mimetype.startsWith("image/") ? (
                                    <img
                                        style={{ width: "200px" }}
                                        alt="uploaded media"
                                        src={message.file.path}
                                    />

                                ) : (
                                    <i className={`file-icon ${getMessageFileIcon(message.file.mimetype)}`} />
                                )}
                                <button onClick={() => handleFileDownload(message.file)} style={{ position: "absolute", left: "5px", top: "5px" }}>Download</button>
                                <p style={{position: "absolute", fontSize: "12px", right: "5px", bottom: "5px"}}>{message.file.size}</p>
                            </div>
                        )}
                        <p>{message.text}</p>
                        <p>{message.timestamp}</p>
                    </div>
                ))}
                {isTyping && <div className="received"><i>Typing...</i></div>}
            </div>
        );
    }
);