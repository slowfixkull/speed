const socket = io();

// DOM elements
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const mediaInput = document.getElementById('media-input');
const linkInput = document.getElementById('link-input');
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
    });
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
    });
});

// Handle send button
sendBtn.addEventListener('click', () => {
    const text = messageInput.value;
    const mediaFile = mediaInput.files[0];
    const link = linkInput.value;

    if (text) {
        socket.emit('message', { room_id: roomId, username: username, type: 'text', content: text });
        messageInput.value = '';
    } else if (mediaFile) {
        const reader = new FileReader();
        reader.onload = () => {
            socket.emit('message', { room_id: roomId, username: username, type: 'media', content: reader.result });
        };
        reader.readAsDataURL(mediaFile); // Encode file as Base64
        mediaInput.value = '';
    } else if (link) {
        socket.emit('message', { room_id: roomId, username: username, type: 'link', content: link });
        linkInput.value = '';
    }
});

// Display received messages
socket.on('message', (data) => {
    const messageElement = document.createElement('div');

    if (data.type === 'text') {
        messageElement.textContent = `${data.username}: ${data.content}`;
    } else if (data.type === 'media') {
        const mediaElement = document.createElement('img');
        mediaElement.src = data.content;
        mediaElement.alt = "Media File";
        mediaElement.style.maxWidth = "200px";
        mediaElement.style.maxHeight = "200px";
        messageElement.appendChild(mediaElement);
    } else if (data.type === 'link') {
        const linkElement = document.createElement('a');
        linkElement.href = data.content;
        linkElement.textContent = `${data.username}: ${data.content}`;
        linkElement.target = "_blank";
        messageElement.appendChild(linkElement);
    }

    chatBox.appendChild(messageElement);
});
