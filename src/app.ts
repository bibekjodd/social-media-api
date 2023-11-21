import 'colors';
import express from 'express';
import { env } from './config/env.config';
import initialConfig from './config/initial.config';
import devConsole from './lib/dev-console';
import { handleErrorRequest } from './middlewares/handle-error-request';
import { notFound } from './middlewares/not-found';
import { router as commentRouter } from './routes/comment.route';
import { router as postRouter } from './routes/post.route';
import userRouter from './routes/user.route';

// -------- app initialization --------
const app = express();
initialConfig(app);

// -------- routes --------
app.use('/api', userRouter);
app.use('/api', postRouter);
app.use('/api', commentRouter);

app.use(notFound);
app.use(handleErrorRequest);

const port = env.PORT || 5000;
app.listen(port, () => {
  devConsole(`Server listening at http://localhost:${port}`.yellow);
});
