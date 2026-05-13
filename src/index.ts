import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import mediaRoutes from './routes/media_routes';
import { connectRabbitMQ } from './messaging/rabbitmq';
import { errorHandler } from './handlers/error_handler';
import { swaggerOptions } from './config/swagger';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'MediaService', minioBucket: process.env.MINIO_BUCKET_NAME });
});

app.use('/media', mediaRoutes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`MediaService corriendo en http://localhost:${port}`);
    console.log(`Documentación disponible en http://localhost:${port}/docs`);
});

connectRabbitMQ();