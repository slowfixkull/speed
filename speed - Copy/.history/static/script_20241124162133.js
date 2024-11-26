const socket = io();

// DOM Elements
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let roomId;
let username = prompt("Enter your username:");

// Event listeners
createRoomBtn.addEventListener('click', async () => {
    const password = prompt("Set a password for your room:");
    const response = await fetch('/create_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    });
    const data = await response.json();
    alert(`Room created! Share this ID: ${data.room_id} and password: ${data.password}`);
    joinChat(data.room_id);
});

joinRoomBtn.addEventListener('click', async () => {
    const roomIdInput = prompt("Enter the room ID:");
    const password = prompt("Enter the room password:");
    const response = await fetch('/validate_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomIdInput, password }),
    });
    const data = await response.json();
    if (data.status === "success") {
        joinChat(roomIdInput);
    } else {
        alert("Invalid room ID or password!");
    }
});

function joinChat(id) {
    roomId = id;
    chatContainer.classList.remove('hidden');
    socket.emit('join', { username, room_id: roomId });
}

sendBtn.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim()) {
        socket.emit('message', { message, room_id: roomId });
        appendMessage(`You: ${message}`);
        messageInput.value = '';
    }
});

socket.on('message', (data) => {
    appendMessage(data);
});

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}
