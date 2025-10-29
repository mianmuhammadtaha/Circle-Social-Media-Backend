const express = require('express')
const route = express.Router()
const {signup, signin , updateprofile , addpost , getpost , getUserData , likepost , postcomment , getcomment , postreply , getmyposts , deletepost, followUser , getallfollowers , getallfollowing , followaccept , followdelete} = require('../controllers/userController')
// const uploads = require('../middlewares/multerMiddleware')
// const profileUploads = require('../middlewares/profileMulterMiddleware')

const uploads = require('../middlewares/cloudinaryMulterMiddelware')
const  {authMiddleWare} = require('../middlewares/userAuthMiddleWare')

route.post('/signup' , signup)

route.post('/signin' ,   signin)

route.put('/updateprofile' ,authMiddleWare , uploads.single('profileimage') , updateprofile)

route.post('/addpost' ,authMiddleWare ,uploads.single('postimage'), addpost)

route.get('/getpost' ,authMiddleWare, getpost)

route.get('/getUserData', authMiddleWare , getUserData)

route.post('/likepost' , authMiddleWare , likepost)

route.post('/postcomment' , authMiddleWare , postcomment )

route.get('/getcomment' , authMiddleWare , getcomment )

route.post('/postreply' , authMiddleWare , postreply )

route.get('/getmyposts' , authMiddleWare , getmyposts)

route.post('/deletepost' , authMiddleWare , deletepost)

route.post('/follow' , authMiddleWare , followUser)

route.get('/getallfollowers' , authMiddleWare , getallfollowers)

route.get('/getallfollowing' ,authMiddleWare , getallfollowing)

route.patch('/followaccept' , authMiddleWare , followaccept)

route.delete('/followdelete' , authMiddleWare , followdelete)

module.exports = route