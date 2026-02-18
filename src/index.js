// require("dotenv").config({path: "./env"})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

dotenv.config({
    path: './env'
})



connectDB();








/*
// this approach is not preffered
import express from "express";
const app = express()

;( async ()=>{ // IIFE, ';' at the begining of iife for best practices (if previous line is missing ';' at the end)
    try { // when talking to DB use async-await and wrap it up in try-catch block, beacuse talking to DB may take time
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('error', (error) => {
            console.log(`Error:  ${error}`);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is running on port: ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("Error: ", error)
        throw err
    }
})()
*/
