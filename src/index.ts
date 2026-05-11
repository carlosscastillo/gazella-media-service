import express from 'express';
import cors from 'cors';
import mediaRoutes from './routes/media_routes';
import { connectRabbitMQ } from './messaging/rabbitmq';
import { errorHandler } from './handlers/error_handler';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/media', mediaRoutes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`MediaService corriendo en http://localhost:${port}`);
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'MediaService', minioBucket: process.env.MINIO_BUCKET_NAME });
});

connectRabbitMQ();

app.listen(port, () => {
    console.log(`MediaService corriendo en http://localhost:${port}`);
});