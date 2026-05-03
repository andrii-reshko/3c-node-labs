import { WebSocket } from 'ws';

const WS_URL = process.argv[2] || 'ws://127.0.0.1:3001/ws';

console.log(`Підключення до ${WS_URL}...`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('Підключено!');
});

ws.on('message', (data) => {
  console.log('Отримано:', data.toString());
});

ws.on('error', (err) => {
  console.error('Помилка:', err.message);
});

ws.on('close', () => {
  console.log("З'єднання закрито");
  process.exit(0);
});

process.on('SIGINT', () => {
  ws.close();
});
