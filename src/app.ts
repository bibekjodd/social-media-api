import 'colors';
import express from 'express';
import initialConfig from './config/initial.config';
import devConsole from './lib/dev-console';
import { handleErrorRequest } from './middlewares/handle-error-request';
import { notFound } from './middlewares/not-found';
import userRoute from './routes/user.route';
import { env } from './config/env.config';

// -------- app initialization --------
const app = express();
initialConfig(app);

// -------- routes --------
app.use('/api', userRoute);

app.use(notFound);
app.use(handleErrorRequest);

const port = env.PORT || 5000;
app.listen(port, () => {
  devConsole(`Server listening at http://localhost:${port}`.yellow);
});
