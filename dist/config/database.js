"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set("autoIndex", false);
const connectDatabase = async () => {
    try {
        const { connection } = await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log(`Mongodb connected at ${connection.host}`.magenta);
    }
    catch (error) {
        if (error instanceof Error)
            console.log(error.message);
        console.log(`Error occured while connecting mongodb`.red);
    }
};
exports.connectDatabase = connectDatabase;
