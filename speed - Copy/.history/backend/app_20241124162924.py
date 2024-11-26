from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, send
import secrets

# Initialize Flask app
app = Flask(__name__, template_folder="../templates", static_folder="../static")
app.config['SECRET_KEY'] = secrets.token_hex(16)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store room data
rooms = {}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/create_room', methods=['POST'])
def create_room():
    room_id = secrets.token_hex(4)  # Generate a random room ID
    password = request.json.get('password')
    rooms[room_id] = password
    return {"room_id": room_id, "password": password}, 201

@app.route('/validate_room', methods=['POST'])
def validate_room():
    data = request.json
    room_id = data.get("room_id")
    password = data.get("password")
    if room_id in rooms and rooms[room_id] == password:
        return {"status": "success"}, 200
    return {"status": "failure"}, 400

@socketio.on('join')
def handle_join(data):
    username = data['username']
    room_id = data['room_id']
    join_room(room_id)
    send(f"{username} has joined the room.", to=room_id)

@socketio.on('message')
def handle_message(data):
    room_id = data['room_id']
    message = data['message']
    send(message, to=room_id)

if __name__ == '__main__':
    socketio.run(app, debug=True)
