import { Avatar } from "@mui/material";

const ChatHeader = ({ client, groupData }) => {

    return (
        <>
            {client.username ?
                <div className="chat-header">
                    <Avatar alt={client.username} src='/profile-image.jpg' />
                    <h3>{client.username}</h3>
                    <span style={{ color: client.online ? "green" : "red" }}>{client.online ? "online" : "offline"}</span>
                </div> :
                <div className="chat-header">
                    <Avatar alt={groupData.name + "avatar"} src={groupData.avatar} />
                    <div>
                        <h3>{groupData.name}</h3>
                        <p>{groupData.members.map(member => member.username).sort().join(", ")}</p>
                    </div>
                </div>
                
            }
        </>
    );
}

export default ChatHeader;