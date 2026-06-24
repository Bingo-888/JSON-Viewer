import cors from 'cors';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const corsMiddleware = cors({
  origin: isDevelopment
    ? (origin, callback) => {
        if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      }
    : false,
  credentials: true,
});
