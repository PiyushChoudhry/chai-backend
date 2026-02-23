import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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


export { registerUser }