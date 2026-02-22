import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) { // req -> json data; file -> json doesn't have file that's why, multer (or file uploader of express) is used
    cb(null, "./public/temp") // null is for error handling
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)
    
    cb(null, file.originalname) // it is riskier as many file with same name may overwrite other files, but it is for short duartion of time that file will be stored on server and then uploaded on cloudinary and then deleted later on from server
  }
})

export const upload = multer({ 
    storage,
})