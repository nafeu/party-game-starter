import io from 'socket.io-client';
import socketEvents from './socket-events';
import {
  joinButton,
  createButton,
  usernameInput,
  roomInput,
} from './dom-elements';

const PORT = process.env.PORT || 8000;
const socket = io(`http://localhost:${PORT}`);
const urlParams = new URLSearchParams(window.location.search);

const client = {
  username: null,
  roomId: null,
  state: 'LOBBY', // LOBBY, WAITING, IN-GAME
};

socketEvents.use(socket, client);

joinButton.addEventListener('click', () => {
  socket.emit('JOIN_ROOM', {
    username: usernameInput.value,
    roomId: roomInput.value,
  });
});

createButton.addEventListener('click', () => {
  socket.emit('CREATE_ROOM', {
    username: usernameInput.value,
  });
});

const roomParam = urlParams.get('room');
if (roomParam && roomParam.length > 0) {
  roomInput.value = roomParam;
  createButton.style.display = 'none';
}
