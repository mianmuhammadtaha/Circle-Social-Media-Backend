
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../model/userModel')
const Post = require('../model/addPostModel')
const Like = require('../model/likesModel')
const Comment = require('../model/commentModel')
const Reply = require('../model/replyCommentModel')
const Follow = require('../model/followModel')

async function signup(req, res) {
    try {
        const { firstname, lastname, email, dob, gender, password, confirmpassword } = req.body;

        if (password !== confirmpassword) {
            return res.status(400).json({ success: false, message: "Passwords mis-match." })
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email already taken." })
        }

        const saltround = 10
        const hashed_password = await bcrypt.hash(password, saltround)

        const user = await User.create({
            firstname,
            lastname,
            email,
            dob,
            gender,
            password: hashed_password
        });
        user.save()


        return res.status(201).json({
            success: true,
            message: "Signed up successfully.",
        })
    }
    catch (err) {
        console.log("signup Controller error ----", err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error. Please try again." })
    }
}

async function signin(req, res) {
    try {

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." })
        }


        const isUser = await User.findOne({ email: email })
        // console.log(isUser);

        if (!isUser) {
            return res.status(400).json({ success: false, message: "User not found." })
        }
        const check_password = await bcrypt.compare(password, isUser.password)
        // console.log(check_password)

        if (!check_password) {
            return res.status(400).json({ success: false, message: "Password is incorrect." })
        }

        const token = jwt.sign(
            { id: isUser.id },
            process.env.SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRES }
        )
        return res.status(200).json({ success: true, message: "Signed in Successfully.", token, isUser })

    }
    catch (err) {
        console.log("Sign in controller error ------", err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error. Please try again." })
    }
}

async function updateprofile(req, res) {
    try {
        const { firstname, lastname, email } = req.body;
        const user_id = req.user_id;

        if (!firstname && !lastname && !email && !req.file) {
            return res
                .status(400)
                .json({ success: false, message: "No data provided for update." });
        }

        const updateData = { firstname, lastname, email };

        if (req.file) {
            updateData.profileImg = req.file.path
        }
        // console.log("Cloudinary Upload Info =>", req.file);

        const updatedUser = await User.findByIdAndUpdate(user_id, updateData, {
            new: true,
        });

        if (!updatedUser) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }

        // console.log("Updated User:", updatedUser);

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully.",
            updatedUser,
        });
    } catch (err) {
        console.log("upload Profile error-------", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again in a while.",
        });
    }
}



async function addpost(req, res) {
    try {
        const { description = "", hashtag = "" } = req.body;
        // if (!description || !hashtag || !req.file) {
        //     return res.status(400).json({ success: false, message: "Description, Hahtag, File is required." })
        // }
        // console.log("Cloudinary Upload Info =>", req.file);

        const newpost = await Post.create({
            description: description,
            hashtag: hashtag,
            filepath: req.file.path,
            user_id: req.user_id
        })
        newpost.save();

        return res.status(200).json({ success: true, message: "Post Created Successfully" })
    }
    catch (err) {
        console.log("Addpost controller error-----------", err.message)
        return res.status(500).json({ success: false, message: "Server error. Please try again." })
    }
}


async function getpost(req, res) {
    try {
        // console.log("1")
        const skipCount = parseInt(req.query.skip) || 0;
        // console.log("2")
        // const users = await User.find({}).select('_id').lean();
        // console.log("3")

        // const postsData = [];
        // console.log("4")

        // for (let i = 0; i < users.length; i++) {
        //     const user_id = users[i]._id;

        const postsData = await Post.find({})
            .sort({ createdAt: -1 })
            .skip(skipCount)
            .populate("user_id", "firstname lastname profileImg")
            .lean();

        // {

        // // Run this once to fix counts
        // const posts = await Post.find();
        // for (const post of posts) {
        //     const count = await Comment.countDocuments({ post_id: post._id });
        //     post.commentCount = count;
        //     await post.save();
        // }

        // } ya oper wala code ma na chalaya hai ta k comments k count ko sab ma sahi sa la sako 

        const finalPosts = postsData.map(p => ({
            ...p,
            isLiked: p.likes.some(likeId => likeId.toString() === req.user_id.toString()), // ✅ ObjectId safe comparison
            commentCount: p.commentCount ? p.commentCount : 0
        }));

        // console.log(finalPosts)
        // console.log("6")
        res.status(200).send({ data: finalPosts });
    } catch (err) {
        console.log('find Err ===', err.message);
        res.status(500).send({ Error: err.message });
    }
}



async function getUserData(req, res) {
    try {
        const user_id = req.user_id;
        const user = await User.findById(user_id).select("-password")
        if (user) {
            return res.status(200).json({ success: true, message: "Data fetched Successfully.", user })
        }
    }
    catch (err) {
        console.log("get User Data error -----", err.message)
        return res.status(500).json({ success: false, message: "Internal Server error." })
    }
}

async function likepost(req, res) {
    try {
        const { post_id } = req.body;
        const user_id = req.user_id;
        const isliked = await Like.findOne({ user_id, post_id })
        if (isliked) {
            await Like.deleteOne({ user_id, post_id });
            // const totalLike = await Like.countDocuments({ post_id })

            const totalLike = await Post.findByIdAndUpdate(post_id, {
                $pull: { likes: user_id },
                $inc: { likecount: -1 }
            },
                { new: true } // ✅ ye ensure karta hai ke updated document return ho
            ).select("likecount")
            // console.log(totalLike)

            const io = req.app.get('io')
            io.emit('like_count', { totalLike: totalLike.likecount, post_id: post_id })

            return res.json({ success: true, message: "Like removed", totalLike: totalLike.likecount });
        }
        else {
            await Like.create({ user_id, post_id });

            // const totalLike = await Like.countDocuments({ post_id })

            const totalLike = await Post.findByIdAndUpdate(post_id, {
                $push: { likes: user_id },
                $inc: { likecount: 1 }
            },
                { new: true } // ✅ ye ensure karta hai ke updated document return ho
            ).select("likecount")

            // console.log(totalLike)
            const io = req.app.get('io')
            io.emit('like_count', { totalLike: totalLike.likecount, post_id: post_id })


            return res.json({ success: true, message: "Post liked", totalLike: totalLike.likecount });
        }
    }
    catch (err) {
        console.log("Like Post controller Error ----", err.message)
        return res.status(500).json({ success: false, message: " Internal Server Error. Please Try again." })
    }

}

async function postcomment(req, res) {
    try {
        const user_id = req.user_id;
        const { post_id, comment } = req.body;

        // 🧩 Validation
        if (!post_id || !comment) {
            return res.status(400).json({
                success: false,
                message: "Post ID and comment are required.",
            });
        }

        // 📝 Create comment (only save IDs and text)
        const newComment = await Comment.create({
            comment,
            user_id,
            post_id,
        });
        if (newComment) {
            // After creating new comment
            await Post.findByIdAndUpdate(post_id, { $inc: { commentCount: 1 } });
        }

        // 🧍‍♂️ Populate user data (firstname, lastname, profileImg)
        const populatedComment = await newComment.populate(
            "user_id",
            "firstname lastname profileImg"
        );

        const comment_count = await Comment.countDocuments({ post_id })
        console.log("Comment counts --------", comment_count)

        const io = req.app.get('io');
        io.emit('comment', { populatedComment: populatedComment, comment_count: comment_count })

        return res.status(201).json({
            success: true,
            message: "Comment added successfully.",
            comment: populatedComment,
        });

    } catch (err) {
        console.log("postcomment controller Error ----", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again.",
        });
    }
}

async function getcomment(req, res) {
    try {
        const { post_id } = req.query;

        const comments = await Comment.find({ post_id })
            .populate("user_id", "firstname lastname profileImg")
            // 👇 Add this block to also populate replies
            .populate({
                path: "replies", // field name you added in Comment schema
                populate: {
                    path: "user_id", // reply's user
                    select: "firstname lastname profileImg"
                }
            })
            .sort({ createdAt: -1 }); // latest comment first

        // console.log(comments)
        return res.status(200).json({
            success: true,
            message: "Comments fetched successfully.",
            comments,
        });
    } catch (err) {
        console.log("getcomment controller Error ----", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please Try again.",
        });
    }
}

async function postreply(req, res) {
    try {
        // console.log('1')
        const { message, post_id, comment_id } = req.body;
        // console.log('2')

        const user_id = req.user_id;
        // console.log('3')

        if (!message || !post_id || !comment_id) {

            return res.status(400).json({
                success: false,
                message: "Missing required fields (message, post_id, comment_id)",
            });
        }
        // console.log('4')

        const postExists = await Post.findById(post_id);
        // console.log('5')

        const commentExists = await Comment.findById(comment_id);
        // console.log('6')

        if (!postExists || !commentExists) {
            return res.status(404).json({
                success: false,
                message: "Post or Comment not found",
            });
        }
        // console.log('7')

        const reply = await Reply.create({
            message,
            user_id,
            comment_id,
            post_id,
        });
        // console.log('8')

        // ✅ Push this reply’s ID into the related comment’s replies array
        await Comment.findByIdAndUpdate(
            comment_id,
            { $push: { replies: reply._id } }
        );
        // console.log('9')

        const populatedReply = await Reply.findById(reply._id)
            .populate("user_id", "firstname lastname profileImg")
            .populate("comment_id", "comment");
        // console.log('10')

        const io = req.app.get('io')
        io.emit('commentreply', { populatedReply, post_id, comment_id })

        return res.status(201).json({
            success: true,
            message: "Reply sent successfully",
            reply: populatedReply,
        });

    }
    catch (err) {
        console.error("postReply error ---->", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
}

async function getmyposts(req, res) {
    try {
        const user_id = req.user_id;
        const posts = await Post.find({ user_id })
            .populate("user_id", "firstname lastname profileImg")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        console.log("Get my post error------", err.message)
        res.status(500).json({ success: false, message: "Failed to load user posts" });
    }
}

async function deletepost(req, res) {
    const user_id = req.user_id;
    const { post_id } = req.body;
    if (!post_id || !user_id) {
        return res.status(400).json({ success: false, message: "Post Not Found" })
    }
    // const ispost = await post
    const deleted_post = await Post.deleteOne({ _id: post_id })
    console.log(deleted_post)
    if (deleted_post) {
        return res.status(200).json({ success: false, message: "Post Deleted Successfully." })
    }
}

async function followUser(req, res) {
    try {
        const user_id = req.user_id;
        const { targetUser } = req.body
        if (!user_id || !targetUser) {
            return res.status(400).json({ success: false, message: "Try again" })
        }
        const findfollow = await Follow.findOne({ user_id: user_id, targetUser: targetUser })
        // console.log(findfollow)
        // console.log("1")
        if (findfollow) {
            // console.log("2")
            return res.status(400).json({ success: false, message: "Already Requested" })
        }
        // console.log("3")

        const follow = await Follow.create({
            user_id: user_id,
            targetUser: targetUser,
        })
        // console.log("4")
        const io = req.app.get('io')
        io.to(targetUser.toString()).emit("follow_request", {
            senderId: user_id,
            targetUser,      // add this
            message: "You have a new follow request"
        });


        // console.log(follow)
        return res.status(200).json({ success: true, status: follow.status })
    }
    catch (err) {
        console.log("Follow Controller error -----", err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

async function getallfollowers(req, res) {
    try {
        const user_id = req.user_id;
        // console.log("user_id-----" , user_id)
        if (!user_id) {
            return res.status(400).json({ success: false, message: "unauthorized" })
        }
        const allfollowers = await Follow.find({
            $and: [
                { targetUser: user_id },
                { status: "Pending" }
            ]
        })
            .populate("user_id", "firstname lastname profileImg")
        // .populate("targetUser" , "firstname lastname profileImg")
        // console.log("All Followers With Pending------------ " , allfollowers)
        return res.status(200).json({ success: true, data: allfollowers })
    }
    catch (err) {
        console.log("getallfollowers err------", err.message)
    }

}
async function getallfollowing(req, res) {
    try {
        const user_id = req.user_id;
        // console.log("user_id-----" , user_id)
        if (!user_id) {
            return res.status(400).json({ success: false, message: "unauthorized" })
        }
        const allfollowing = await Follow.find({ user_id: user_id })
        // .populate("targetUser" , "firstname lastname profileImg") 
        // .populate("user_id" , "firstname lastname profileImg" )
        // console.log("Following -----", allfollowing)
        return res.status(200).json({ success: true, data: allfollowing })
    }
    catch (err) {
        console.log("getallfollowing err------", err.message)
    }

}

async function followaccept(req, res) {
    try {
        const user_id = req.user_id;
        const { followCollection_id } = req.body;
        console.log(followCollection_id);
        console.log(user_id)
        const findFollow = await Follow.findOne({ _id: followCollection_id })
        if (!findFollow) {
            return res.status(400).json({ success: false, message: "Follow request not Found!" })
        }

        const updateStatus = await Follow.findByIdAndUpdate(
            followCollection_id,
            { status: "Accepted" }
        )
        // console.log("Follow ID check ----", updateStatus)
        const io = req.app.get('io')
        io.to(findFollow.user_id.toString()).emit("follow_accepted", {
            followerId: findFollow.user_id,  // who sent the request
            receiverId: findFollow.targetUser, // who accepted
            message: "Your follow request was accepted"
        });


        return res.status(200).json({ success: true, message: "Requested Accepted." })

    }
    catch (err) {
        console.log("followaccept Controller Error ----- ", err.msg)
        return res.status(500).json({ success: false, message: "Internal Server Error." })
    }
}
async function followdelete(req, res) {
    try {
        const { followCollection_id } = req.body;
        const user_id = req.user_id;

        const findFollow = await Follow.find({
            _id: followCollection_id,
            targetUser: user_id
        });

        if (!findFollow || findFollow.length === 0) {
            return res.status(400).json({ success: false, message: "Request not found." })
        }

        await Follow.deleteOne({ _id: followCollection_id });

        const io = req.app.get('io');
        io.to(findFollow[0].user_id.toString()).emit("follow_deleted", {
            senderId: findFollow[0].user_id, // request bhejne wale ka ID
            targetUser: findFollow[0].targetUser,
            message: "Your follow request was rejected"
        });


        return res.status(200).json({ success: true, message: "Request deleted successfully." });
    } catch (err) {
        console.log("followdelete error ------", err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { signup, signin, updateprofile, addpost, getpost, getUserData, likepost, postcomment, getcomment, postreply, getmyposts, deletepost, followUser, getallfollowers, getallfollowing, followaccept, followdelete }
