import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async(userId) => { // asyncHandler is not required here because we are not handling the web requests, it is our internal method which is used here internally only
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false }) // so you don't have to pass password, as mongoose's model will kick in and they find password is required field.

        return {accessToken, refreshToken}
    
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    /*
        1. get user details from frontend
        2. validation - not empty
        3. check if user already exists: username, email
        4. check for images, check for avatar
        5. upload them to cloudinary, avatar
        6. create user object - create entry in db
        7. remove password and refresh token field from response
        8. check for user creation success
        9. return response
    */

    // 1. 
    const {fullName, email, username, password} = req.body // if data is coming from "form" or "json" then, it will found in "req.body"
    // console.log("email: ", email);
    // console.log("req.body: ", req.body);
 
    // 2.
    // if(fullName === ""){
    //     throw new ApiError(400, "fullName is required")
    // }

    if(
        [fullName, email, username, password].some((field) => field?.trim() === "") // .some() retruns true or false, .map() will also works but .some() is simpler
    ){
        throw new ApiError(400, "All fields are required")
    }

    // 3.
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    
    // 4.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // if it is not given then it will raise like: "TypeError: Cannot read properties of undefined"

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    
    // console.log("req.files: ", req.files);
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // 5.
    const avatar = await uploadOnCloudinary(avatarLocalPath) // "await" because uploading may take time
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    // 6.
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // because we have already checked for avatar
        email,
        password,
        username: username.toLowerCase()
    })

    // 7.
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    // 8.
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 9.
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )



} )

const loginUser = asyncHandler( async (red, res) => {
    /*
        1. req body -> data
        2. username or email
        3. find the user
        4. password check
        5. access and refresh token
        6. send secure cookies
        7. send res about successful login
    */


        // 1. 
        const {email, username, password} = req.body

        // 2.
        if(!username || !email){
            throw new ApiError(400, "username or email is required")
        }

        // 3.

        // const user = await User.findOne({email}) // finding by email only

        // const user = await User.findOne({username}) // finding by username only

        // finding by either username or email:
        const user = await User.findOne({
            $or: [{username}, {email}]
        })

        if(!user){
            throw new ApiError(404, "User does not exist")
        }

        // 4.
        const isPasswordValid = await user.isPasswordCorrect(password) // "user" is used here, not "User" because "User" is object of MongoDB's mongoose and only have mongoose's methods not users (us) crearted. therefore our created methods will be access only by "user"

        if(!isPasswordValid){
            throw new ApiError(401, "Invalid user credentials")
        }

        //  5. 
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
        
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken") // if calling DB is not expensive query, else simple update this object
        
        // 6. 
        const options = { // by default cookies can be modified by all at frontend, but when httpOnly and secure are true they can be modified by server only, although it can be viewed at frontend
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, // status code
                { // data
                    user: loggedInUser, accessToken, refreshToken // when user wants to save accessToken and refreshToken in its local storage, or developing a mobile applications because cookies will not set there, although it is not best practice
                },
                "User Logged In Successfully" // message
            )
        )
})

const logoutUser = asyncHandler(async(req, res) => {
    // we have access of "req.body, req.cookie, req.body" here because of a middleware

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
            httpOnly: true,
            secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))

})

export { 
    registerUser, 
    loginUser, 
    logoutUser 
}