import { useState, useEffect, createContext } from "react";
import socket from "../../socket-client";
import { fetchUserData } from "../../lib/api";

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [ currentUser, setCurrentUser ] = useState(null);

    useEffect(() => {
        socket.emit("currentUser", null, async ({ currentUserId }) => {
            const currentUser = await fetchUserData(currentUserId);
            setCurrentUser(currentUser);
        });

    }, []);

    return(
        <UserContext.Provider value={{currentUser}} >
            {children}
        </UserContext.Provider>
    )
}


export {UserContext, UserProvider};

