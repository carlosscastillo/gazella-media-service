import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection: any;
let channel: any;
const EXCHANGE_NAME = 'gazella_exchange';

export const connectRabbitMQ = async () => {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();
        
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
        
        console.log('Conectado exitosamente a RabbitMQ');
    } catch (error) {
        console.error('Error conectando a RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000);
    }
};

export const publishEvent = (routingKey: string, data: any) => {
    if (!channel) {
        console.error('No se puede publicar el evento, el canal de RabbitMQ no está listo');
        return;
    }
    
    const message = Buffer.from(JSON.stringify(data));
    channel.publish(EXCHANGE_NAME, routingKey, message);
    console.log(`[x] Evento publicado: ${routingKey}`);
};