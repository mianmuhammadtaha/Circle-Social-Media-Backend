const express = require('express')

const multer = require('multer')

const storage = multer.diskStorage({
    destination : (req , file  ,cb) => {
        cb(null , 'Uploads')
    },
    filename: (req, file , cb) =>{
        cb(null, Date.now() + "-" + file.originalname)
    }
});

const uploads = multer({storage : storage})

module.exports = uploads