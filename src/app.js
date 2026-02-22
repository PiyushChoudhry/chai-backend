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

// routes import
import userRouter from "./routes/user.routes.js"


// routes declaration
// app.get() // it is not used here as before we are writing routes and controllers then and there only, but now we segregated things, so for using router, we must have to use middleware (and it is used by "app.use()")

app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/users/login // and if login is also there in "user.routes.js" like register then it will look like this

export { app }