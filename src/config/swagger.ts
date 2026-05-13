import { Options } from "swagger-jsdoc";

export const swaggerOptions: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Gazella Media Service API",
            version: "1.0.0",
            description: "Gazella Media microservice API Documentation",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env["PORT"]}`,
                description: "Development Server",
            },
        ],
    },
    apis: [
    `${__dirname}/../routes/*.ts`,
    `${__dirname}/../routes/*.js`,
    ]
};