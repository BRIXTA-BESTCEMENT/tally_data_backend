// index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';

// 1. Load Environment Variables
dotenv.config();

// 2. Initialize Express App
const app = express();
const port = process.env.PORT || 3001; // Use a distinct port like 3001 for Tally

// 3. Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Basic Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'Tally Data Backend',
    timestamp: new Date().toISOString()
  });
});

// 5. Placeholders for your future routes and gRPC server
// import tallyRoutes from './src/routes/tally.routes';
// app.use('/api/tally', tallyRoutes);

// import { startGrpcServer } from './src/grpc/grpc-server';
// startGrpcServer();

// 6. Create HTTP Server
const server = createServer(app);

server.listen(port, () => {
  console.log(`🚀 [Tally Backend] Server is running on http://localhost:${port}`);
});

// 7. Graceful Shutdown (Important for Neon Serverless/WebSockets)
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});