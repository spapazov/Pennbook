const db = require('../db/database.js');
const storage = require('../db/storage.js');
const jwt = require('jsonwebtoken');
const secret = process.env.TOKEN_SECRET;

const checkPermission = function(user, accessedUser, res, callback) {
    db.isFriend(user, accessedUser, function(err, isFriend) {
        if (err || !isFriend) {
            res.json({
                success: false,
                error: err || "Not authorized",
            });
            return;
        }
        callback();
    });
}

const jsonCallback = (res) => (err, result) => {
    let data = { 
        error: err,
        result: result
    };
    res.status(err ? 400 : 200)
    res.json(data);
}

const login = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    db.login(username, password, function(error, success) {
        let token = null;
        if (success) {
            token = jwt.sign({ username: username }, secret);
        }
        res.json({
            error: error,
            success: success,
            token: token
        });
    });
}

const changePassword = function(req, res) {
    var username = req.auth.username;
    var oldPassword = req.body.old;
    var newPassword = req.body.new;

    db.changePassword(username, oldPassword, newPassword, jsonCallback(res));
}


const signup = function(req, res) {
    var user = req.body;

    db.signup(user, function(error, success) {
        let token = null;
        if (success) {
            token = jwt.sign({ username: user.username }, secret);
        }
        res.json({
            error: error,
            success: success,
            token: token
        });
    });
}


const post = function(req, res) {
    var post = req.body;
    var username = req.auth.username;
    var wall = post.wall;
    checkPermission(username, wall, res, function() {
        db.post(post, jsonCallback(res));
    });
}


const reaction = function(req, res) {
    var reaction = req.body;
    db.reaction(reaction, jsonCallback(res));
}

const removeReaction = function(req, res) {
    var reaction = req.body;
    db.removeReaction(reaction, jsonCallback(res));
}

const userWall = function(req, res) {
    var wall = req.params.username;
    db.userWall(wall, jsonCallback(res));
}

const affiliationWall = function(req, res) {
    var name = req.params.name;
    db.affiliationWall(name, jsonCallback(res));
}

const interestWall = function(req, res) {
    var name = req.params.name;
    db.interestWall(name, jsonCallback(res));
}


const getPost = function(req, res) {
    var postId = req.params.postId;
    db.getPost(postId, jsonCallback(res));
}

const getPostChildren = function(req, res) {
    var postId = req.params.postId;
    db.getPostChildren(postId, jsonCallback(res));
}

const getPostReactions = function(req, res) {
    var postId = req.params.postId;
    db.getPostReactions(postId, jsonCallback(res));
}

const userProfile = function(req, res) {
    var username = req.params.username;
    db.userProfile(username, jsonCallback(res));
}

const addFriend = function(req, res) {
    var username = req.auth.username;
    var friend = req.body.friend;
    db.addFriend(username, friend, jsonCallback(res));
}

const isFriend = function(req, res) {
    var username = req.auth.username;
    var friend = req.params.user;
    db.isFriend(username, friend, jsonCallback(res));
}

const addAffiliation = function(req, res) {
    var username = req.auth.username;
    var data = req.body;
    db.addAffiliation(username, data, jsonCallback(res));
}

const addInterest = function(req, res) {
    var username = req.auth.username;
    var data = req.body;
    db.addInterest(username, data, jsonCallback(res));
}

const removeAffiliation  = function(req, res) {
    var username = req.auth.username;
    var name = req.body.name;
    db.removeAffiliation(username, name, jsonCallback(res));
}

const removeInterest = function(req, res) {
    var username = req.auth.username;
    var name = req.body.name;
    db.removeInterest(username, name, jsonCallback(res));
}

const updateProfile = function(req, res) {
    var username = req.auth.username;
    var data = req.body;
    db.updateProfile(username, data, jsonCallback(res));
}

const uploadPicture = function(req, res) {
    var username = req.auth.username;
    var file = req.file;
    storage.uploadFile(username, file, jsonCallback(res));
}

const wall = function(req, res) {
    var username = req.auth.username;
    db.wall(username, jsonCallback(res));
}

const getFriends = function(req, res) {
    var username = req.auth.username;
    db.getFriends(username, jsonCallback(res));
}

const getGraph = function(req, res) {
    let user = req.auth.username;
    let selected = req.params.selected;
    db.getGraph(user, selected, jsonCallback(res));
}


const chat = function(req, res) {
    let user = req.auth.username;
    let friend = req.body.friend;
    let chatId = req.body.chatId;
    let create = req.body.create;
    db.chat(user, friend, chatId, create, jsonCallback(res));
}

const chats = function(req, res) {
    let user = req.auth.username;
    db.chats(user, jsonCallback(res));
}

const leaveChat = function(req, res) {
    let user = req.auth.username;
    let chatId = req.body.chatId;
    db.leaveChat(user, chatId, jsonCallback(res));
}

const joinChat = function(req, res) {
    let user = req.body.username;
    let chatId = req.body.chatId;
    db.joinChat(user, chatId, jsonCallback(res));
}

const renameChat = function(req, res) {
    let chatId = req.body.chatId;
    let name = req.body.name;
    db.renameChat(chatId, name, jsonCallback(res));
}

const searchUser = function(req, res) {
    let user = req.auth.username;
    let query = req.body.query;
    db.searchUser(user, query, jsonCallback(res));
}

const friendRecommendations = function(req, res) {
    let user = req.auth.username;
    db.friendRecommendations(user, jsonCallback(res));
}

const userAffiliation = function(req, res) {
    let name = req.params.name;
    db.userAffiliation(name, jsonCallback(res));
}

const userInterest = function(req, res) {
    let name = req.params.name;
    db.userInterest(name, jsonCallback(res));
}


const activeUsers = function(active) {
    return function(req, res) {
        let user = req.auth.username;
        db.getFriends(user, function(err, friends) {
            let result = null;
            if (!err) {
                let online = Object.values(active);
                result = friends.filter(e => online.includes(e.username));
            }
            res.json({
                error: err,
                result: result,
            });
        });
    }
}

module.exports = {
    db: db,
    login: login,
    signup: signup,
    post: post,
    reaction: reaction,
    userWall: userWall,
    addFriend: addFriend,
    wall: wall,
    uploadPicture: uploadPicture,
    addAffiliation: addAffiliation,
    addInterest: addInterest,
    removeAffiliation: removeAffiliation,
    removeInterest: removeInterest,
    updateProfile: updateProfile,
    changePassword: changePassword,
    getFriends: getFriends,
    getGraph: getGraph,
    chat: chat,
    chats: chats,
    leaveChat: leaveChat,
    joinChat: joinChat,
    renameChat: renameChat,
    activeUsers: activeUsers,
    searchUser: searchUser,
    friendRecommendations: friendRecommendations,
    userProfile: userProfile,
    removeReaction: removeReaction,
    isFriend: isFriend,
    getPost: getPost,
    getPostChildren: getPostChildren,
    getPostReactions: getPostReactions,
    interestWall: interestWall,
    affiliationWall: affiliationWall,
    userAffiliation: userAffiliation,
    userInterest: userInterest,
}
