import mongoose from "mongoose";

mongoose.set("autoIndex", false);
export const connectDatabase = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Mongodb connected at ${connection.host}`.magenta);
    } catch (error) {
        if (error instanceof Error) console.log(error.message);
        console.log(`Error occured while connecting mongodb`.red);
    }
};
