import express from "express";
import "colors";

import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config({
        path: "./.env",
    });
}

// -------- route imports --------
import { error } from "./middlewares/error";
import { notFound } from "./middlewares/notFound";
import userRoute from "./routes/userRoute";

// -------- app --------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//

// -------- routes --------
app.get("/checkapi", (req, res) => {
    res.send({ message: "Api is working fine" });
});

app.use("/api/v1", userRoute);

app.use(notFound);
app.use(error);
//
export default app;
