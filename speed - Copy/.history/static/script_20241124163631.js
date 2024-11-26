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

// Handle room joining
joinRoomBtn.addEventListener('click', () => {
    const roomIdInput = prompt('Enter Room ID:');
    const passwordInput = prompt('Enter Room Password:');
    
    fetch('/validate_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomIdInput, password: passwordInput })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            roomId = roomIdInput;
            username = prompt('Enter your username:');
            socket.emit('join', { username: username, room_id: roomId });
            chatContainer.classList.remove('hidden');
        } else {
            alert('Invalid Room ID or Password');
        }
    })
    .catch(err => console.error('Error joining room:', err));
});

// Send message event
sendBtn.addEventListener('click', () => {
    const message = messageInput.value;
    if (message) {
        socket.emit('message', { room_id: roomId, username: username, message: message });
        messageInput.value = ''; // Clear the input
    }
});

// Display received messages
socket.on('message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = data;
    chatBox.appendChild(messageElement);
});
