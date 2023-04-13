"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("colors");
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config({
        path: "./.env",
    });
}
// -------- route imports --------
const error_1 = require("./middlewares/error");
const notFound_1 = require("./middlewares/notFound");
const userRoute_1 = __importDefault(require("./routes/userRoute"));
// -------- app --------
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//
// -------- routes --------
app.get("/checkapi", (req, res) => {
    res.send({ message: "Api is working fine" });
});
app.use("/api/v1", userRoute_1.default);
app.use(notFound_1.notFound);
app.use(error_1.error);
//
exports.default = app;
