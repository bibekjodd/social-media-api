import mongoose from "mongoose";
import devConsole from "../lib/dev-console";

global.databaseConnected = false;
export const connectDatabase = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI);
    global.databaseConnected = true;

    devConsole(`Mongodb connected at ${connection.host}`.magenta);
  } catch (error) {
    global.databaseConnected = true;
    if (error instanceof Error) console.log(error.message);

    devConsole(`Error occured while connecting mongodb`.red);
  }
};
