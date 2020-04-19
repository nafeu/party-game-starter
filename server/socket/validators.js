import {
  generateUID,
  clientIsInARoom,
  roomNotExists,
  usernameInUse,
  roomHasPlayers,
  clientIsHostOfRoom
} from '../utils/helpers';

import {
  MAX_PLAYERS_PER_MATCH,
  MIN_PLAYERS_PER_MATCH
} from '../game';

const MIN_USERNAME_LENGTH = 4;
const MAX_USERNAME_LENGTH = 15;

export const validateJoinRoom = ({ roomId, store, username, socket }) => {
  if (!roomId) {
    return 'Please enter a room.';
  }

  if (roomNotExists(store, roomId)) {
    return 'Room does not exist.';
  }

  if (!username) {
    return 'Please enter a username.';
  }

  if (username.length < MIN_USERNAME_LENGTH) {
    return 'Please enter a valid username (at least 4 characters long).';
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    return 'Username is too long (max 15 characters long).';
  }

  if (usernameInUse(store, roomId, username)) {
    return 'Username is already in use.';
  }

  if (clientIsInARoom(store, socket.id)) {
    return 'User already in a room.';
  }

  if (roomHasPlayers(store, roomId, MAX_PLAYERS_PER_MATCH)) {
    return 'Room is full.';
  }
}

export const validateCreateRoom = ({ username, store, socket }) => {
  if (!username) {
    return 'Please enter a username.';
  }

  if (username.length < MIN_USERNAME_LENGTH) {
    return 'Please enter a valid username (at least 4 characters long).';
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    return 'Username is too long (max 15 characters long).';
  }

  if (clientIsInARoom(store, socket.id)) {
    return 'User already in a room.';
  }
}

export const validateStartGame = ({ username, roomId, store, socket }) => {
  if (!roomHasPlayers(store, roomId, MIN_PLAYERS_PER_MATCH)) {
    return `Need at least ${MIN_PLAYERS_PER_MATCH} players to start game.`
  }

  if (!clientIsHostOfRoom(store, roomId, socket.id)) {
    return 'Only the host may start the game.';
  }
}