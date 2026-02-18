import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // mongoose returns a value
        // console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance}`); // => "MongoDB connected !! DB HOST: [object Object]"
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`MONGODB connection FAILED: ${error}`)
        process.exit(1)
    }
}

export default connectDB