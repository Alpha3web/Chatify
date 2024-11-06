const { authenticateSocket } = require('./middleware/authMiddleware');
const { updateOnlineStatus } = require("./controllers/userController");

const io = require('socket.io')({
  cors: true,
});

io.use(authenticateSocket);

io.on('connection', (socket) => {
  updateOnlineStatus(socket.userId, "online", socket);

  socket.join(socket.userId);
  
  socket.on("joined-groups", ({groups, groupNumber}) => {
    groupNumber === "single"? socket.join(groups): groups.forEach(g => socket.join(g))
  });

  socket.on("currentUser", (message, callback) => {
    callback({currentUserId: socket.userId});
  });


  socket.on("typing", ({receiverId}) => {
    socket.to(receiverId).emit("user-typing", socket.userId);
  });
  socket.on("stop-typing", ({receiverId}) => {
    socket.to(receiverId).emit("user-stop-typing", socket.userId);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    updateOnlineStatus(socket.userId, "offline", socket);
  });
});

module.exports = io;