const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-shop', (shopId) => {
      socket.join(`shop-${shopId}`);
      socket.join(`shop-${shopId}-employees`);
      console.log('Joined shop room:', shopId);
    });

    socket.on('leave-shop', (shopId) => {
      socket.leave(`shop-${shopId}`);
      socket.leave(`shop-${shopId}-employees`);
      console.log('Left shop room:', shopId);
    });

    socket.on('join-employee', () => {
      socket.join('employees');
      console.log('Employee joined:', socket.id);
    });

    socket.on('join-client', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log('Client joined order room:', orderId);
    });

    socket.on('order-status-update', (data) => {
      socket.to(`order-${data.orderId}`).emit('order-updated', data);
      socket.to('employees').emit('order-updated', data);
    });

    socket.on('new-order', (orderData) => {
      socket.to('employees').emit('new-order', orderData);
    });

    socket.on('new-message', (data) => {
      socket.to('employees').emit('new-message', data);
      console.log('New message broadcasted to employees:', data.title);
    });

    socket.on('task-update', (data) => {
      socket.to('employees').emit('task-update', data);
      console.log('Task update broadcasted to employees:', data.taskId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  global.io = io;

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
