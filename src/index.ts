import express from 'express';
import cors from 'cors';
import mediaRoutes from './routes/media_routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/media', mediaRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'MediaService', minioBucket: process.env.MINIO_BUCKET_NAME });
});

app.listen(port, () => {
    console.log(`MediaService corriendo en http://localhost:${port}`);
});