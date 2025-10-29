const express = require('express')

const multer = require('multer')

const storage = multer.diskStorage({
    destination : (req , file  ,cb) => {
        cb(null , 'Uploads_Profile')
    },
    filename: (req, file , cb) =>{
        cb(null, Date.now() + "-" + file.originalname)
    }
});

const profileUploads = multer({storage : storage})

module.exports = profileUploads