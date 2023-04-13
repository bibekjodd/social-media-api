"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
(0, database_1.connectDatabase)();
//
app_1.default.listen(process.env.PORT, () => {
    console.log(`Server listening at http://localhost:${process.env.PORT}`.yellow);
});
