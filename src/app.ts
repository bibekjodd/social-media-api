import appConfig from './config/app.config';
import devConsole from './lib/dev-console';
import { handleErrorRequest } from './middlewares/handle-error-request';
import { notFound } from './middlewares/not-found';
import userRoute from './routes/user.route';
import 'colors';
import express from 'express';

// -------- app initialization --------
const app = express();
appConfig(app);

// -------- routes --------
app.use('/api/v1', userRoute);

app.use(notFound);
app.use(handleErrorRequest);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  devConsole(`Server listening at http://localhost:${port}`.yellow);
});
