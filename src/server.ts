import app from "./app";

import { connectDatabase } from "./config/database";
connectDatabase();

//
app.listen(process.env.PORT, () => {
  console.log(
    `Server listening at http://localhost:${process.env.PORT}`.yellow
  );
});
