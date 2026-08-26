import { io } from 'socket.io-client';
import configEnv from '../config';

const socketUrl = configEnv.apiUrl || window.location.origin;

const socket = io(socketUrl, {
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
