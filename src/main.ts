import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { env } from '@environments';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("SFin Application")
    .setVersion("1.0")
    .addTag("sfin")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        in: 'header',
        description: "Enter JWT access token",
      },
      "access-token", // 👈 PHẢI TRÙNG với @ApiBearerAuth
    )
    .build();

  // Cấu hình CORS - Development: cho phép tất cả, Production: chỉ origins được cấu hình
  app.enableCors({
    origin: env.corsConfig.ORIGINS.split(","),
    credentials: env.corsConfig.CREDENTIALS ? true : false,
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"]
  });
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
