import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// app.use() // "use" method is used for middleware and configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public")) // to store public assest on server like photo, file, fevicon that are not sensitive
app.use(cookieParser())




export { app }