// Initialize the Socket.IO client
const socket = io();

// DOM elements
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Store room and username
let roomId;
let username;

// Handle room creation
createRoomBtn.addEventListener('click', () => {
    const password = prompt('Enter a password for the room:');
    
    fetch('/create_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password })
    })
    .then(response => response.json())
    .then(data => {
        roomId = data.room_id;
        alert(`Room created! Room ID: ${roomId}, Password: ${password}`);
    })
    .catch(err => console.error('Error creating room:', err));
});