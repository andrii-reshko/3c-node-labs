import deviceBus from '../../utils/deviceBus.js';
import * as deviceService from '../../services/device.service.js';

const clients = new Set();

deviceBus.on('created', (data) => {
  const payload = JSON.stringify({ event: 'created', data });
  clients.forEach((socket) => socket.send(payload));
});

deviceBus.on('updated', (data) => {
  const payload = JSON.stringify({ event: 'updated', data });
  clients.forEach((socket) => socket.send(payload));
});

deviceBus.on('deleted', (id) => {
  const payload = JSON.stringify({ event: 'deleted', id });
  clients.forEach((socket) => socket.send(payload));
});

async function handleConnection(connection) {
  // @fastify/websocket v11 passes the socket as the first argument
  const ws = connection.socket || connection.ws || connection;

  clients.add(ws);

  const items = await deviceService.getAll();
  const payload = JSON.stringify({ event: 'list', data: items });
  ws.send(payload);

  ws.on('close', () => {
    clients.delete(ws);
  });
}

export default handleConnection;
