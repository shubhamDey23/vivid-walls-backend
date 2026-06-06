import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env';
import routes from './routes';
import { notFound } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// --- Security & infra middleware ---
app.use(helmet());
app.use(
  cors({
    origin:
      env.CORS_ORIGIN === '*'
        ? true
        : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  }),
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// --- Root info ---
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'VividWalls API',
    health: '/api/health',
  });
});

// --- API ---
app.use('/api', routes);

// --- 404 + central error handler (must be last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
