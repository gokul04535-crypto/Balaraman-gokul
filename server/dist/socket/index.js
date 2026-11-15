"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = void 0;
const socket_io_1 = require("socket.io");
const initSocketServer = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        },
    });
    // Track users in rooms: roomId -> Set of { socketId, user }
    const roomUsers = new Map();
    const normalizeRoom = (id) => {
        return (id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    };
    io.on('connection', (socket) => {
        let currentRoom = null;
        let currentUser = null;
        // 1. Join Room
        socket.on('join-room', ({ roomId, user }) => {
            currentRoom = normalizeRoom(roomId);
            currentUser = user;
            socket.join(currentRoom);
            if (!roomUsers.has(currentRoom)) {
                roomUsers.set(currentRoom, new Map());
            }
            const usersInThisRoom = roomUsers.get(currentRoom);
            usersInThisRoom.set(socket.id, user);
            console.log(`[Socket] User ${user?.name || socket.id} joined meeting room: ${currentRoom}`);
            // Send list of existing users to the newly joined user
            const existing = Array.from(usersInThisRoom.entries())
                .filter(([id]) => id !== socket.id)
                .map(([id, u]) => ({ socketId: id, user: u }));
            socket.emit('room-users', existing);
            // Notify others in the room
            socket.to(currentRoom).emit('user-joined', {
                socketId: socket.id,
                user,
            });
        });
        // 2. WebRTC Signaling: Offer
        socket.on('webrtc-offer', ({ roomId, targetSocketId, offer }) => {
            const room = normalizeRoom(roomId) || currentRoom;
            if (!room)
                return;
            if (targetSocketId) {
                io.to(targetSocketId).emit('webrtc-offer', {
                    senderSocketId: socket.id,
                    user: currentUser,
                    offer,
                });
            }
            else {
                socket.to(room).emit('webrtc-offer', {
                    senderSocketId: socket.id,
                    user: currentUser,
                    offer,
                });
            }
        });
        // 3. WebRTC Signaling: Answer
        socket.on('webrtc-answer', ({ roomId, targetSocketId, answer }) => {
            const room = normalizeRoom(roomId) || currentRoom;
            if (!room)
                return;
            if (targetSocketId) {
                io.to(targetSocketId).emit('webrtc-answer', {
                    senderSocketId: socket.id,
                    answer,
                });
            }
            else {
                socket.to(room).emit('webrtc-answer', {
                    senderSocketId: socket.id,
                    answer,
                });
            }
        });
        // 4. WebRTC Signaling: ICE Candidate
        socket.on('webrtc-ice-candidate', ({ roomId, targetSocketId, candidate }) => {
            const room = normalizeRoom(roomId) || currentRoom;
            if (!room)
                return;
            if (targetSocketId) {
                io.to(targetSocketId).emit('webrtc-ice-candidate', {
                    senderSocketId: socket.id,
                    candidate,
                });
            }
            else {
                socket.to(room).emit('webrtc-ice-candidate', {
                    senderSocketId: socket.id,
                    candidate,
                });
            }
        });
        // 5. In-Call Chat Messages
        socket.on('chat-message', ({ roomId, message }) => {
            const room = normalizeRoom(roomId) || currentRoom;
            if (!room)
                return;
            // Broadcast to EVERYONE in the room including sender
            io.to(room).emit('chat-message', message);
        });
        // 6. In-Call Shared Scratchpad / Notes
        socket.on('notes-update', ({ roomId, notes }) => {
            const room = normalizeRoom(roomId) || currentRoom;
            if (!room)
                return;
            // Broadcast to everyone else in the room
            socket.to(room).emit('notes-update', { notes });
        });
        // 7. Session Completed Alert
        socket.on('session-completed', ({ roomId, creditCost, completedBy }) => {
            const room = normalizeRoom(roomId) || currentRoom;
            if (!room)
                return;
            io.to(room).emit('session-completed', { creditCost, completedBy });
        });
        // 8. Screen Share Status Notification
        socket.on('screen-share-status', ({ roomId, isSharing, userId, userName }) => {
            const room = normalizeRoom(roomId) || currentRoom;
            if (!room)
                return;
            console.log(`[Socket] Screen share update in room ${room}: ${userName || userId} isSharing=${isSharing}`);
            socket.to(room).emit('screen-share-status', { isSharing, userId, userName });
        });
        // 8. Disconnect
        socket.on('disconnect', () => {
            if (currentRoom && roomUsers.has(currentRoom)) {
                const usersInThisRoom = roomUsers.get(currentRoom);
                usersInThisRoom.delete(socket.id);
                if (usersInThisRoom.size === 0) {
                    roomUsers.delete(currentRoom);
                }
                else {
                    socket.to(currentRoom).emit('user-left', {
                        socketId: socket.id,
                        user: currentUser,
                    });
                }
            }
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocketServer = initSocketServer;
