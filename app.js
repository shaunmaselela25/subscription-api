import express from 'express'
import cookieParser from 'cookie-parser';

import { PORT } from './config/env.js';

import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';

import connectToDB from './database/mongodb.js';
import errorMiddleware from './middleware/error.middleware.js';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/subscriptions', subscriptionRouter);

app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Welcome to Subscription Tracker API!');
});

app.listen(PORT, async () => {
  console.log(`Subscription Tracker API is running on port http://localhost:${PORT}`);

  await connectToDB();
});



export default app;