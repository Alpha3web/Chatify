import { io } from 'socket.io-client';
const tokenMatch = document.cookie.match(/token=([^;]*)/); 
const token = tokenMatch ? tokenMatch[1] : null;


const socket = io("http://localhost:5000", {
    auth: {
        token: token,
    },
});


export default socket;