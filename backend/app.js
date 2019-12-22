require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const socket = require('socket.io');
const jwt = require('express-jwt');
const routes = require('./routes/routes.js');
const storage = require('./db/storage.js');

const port = process.env.PORT;
const path = process.env.API_PATH;
const debug = process.env.MODE == 'debug';
const cors = require('cors');

const app = express();
app.use(bodyParser.json())
app.use(cors({origin: '*'}));
app.use(jwt({secret: process.env.TOKEN_SECRET, requestProperty: 'auth'}).unless({path: [`${path}/login`, `${path}/signup`]}));

var activeUsers = {};

app.post(`${path}/login`, routes.login);
app.post(`${path}/signup`, routes.signup);
app.post(`${path}/post`, routes.post);
app.post(`${path}/reaction/add`, routes.reaction);
app.post(`${path}/reaction/remove`, routes.removeReaction);
app.post(`${path}/friends/add`, routes.addFriend);
app.post(`${path}/interest/add`, routes.addInterest);
app.post(`${path}/interest/remove`, routes.removeInterest);
app.post(`${path}/affiliation/add`, routes.addAffiliation);
app.post(`${path}/affiliation/remove`, routes.removeAffiliation);
app.post(`${path}/profile/update`, routes.updateProfile);
app.post(`${path}/password/change`, routes.changePassword);
app.post(`${path}/picture/upload`, storage.upload, routes.uploadPicture);
app.post(`${path}/user/search`, routes.searchUser);
app.post(`${path}/chat/join`, routes.joinChat);
app.post(`${path}/chat/leave`, routes.leaveChat);
app.post(`${path}/chat/rename`, routes.renameChat);
app.post(`${path}/chat`, routes.chat);


app.get(`${path}/chat/all`, routes.chats);
app.get(`${path}/user/active`, routes.activeUsers(activeUsers));
app.get(`${path}/user/recommendations`, routes.friendRecommendations);
app.get(`${path}/user/affiliated/:name`, routes.userAffiliation);
app.get(`${path}/user/interest/:name`, routes.userInterest);
app.get(`${path}/friends`, routes.getFriends);
app.get(`${path}/friend/:user`, routes.isFriend);
app.get(`${path}/wall`, routes.wall);
app.get(`${path}/wall/user/:username`, routes.userWall);
app.get(`${path}/wall/affiliated/:name`, routes.affiliationWall);
app.get(`${path}/wall/interest/:name`, routes.interestWall);
app.get(`${path}/post/:postId`, routes.getPost);
app.get(`${path}/post/:postId/children`, routes.getPostChildren);
app.get(`${path}/post/:postId/reactions`, routes.getPostReactions);
app.get(`${path}/profile/:username`, routes.userProfile);
app.get(`${path}/graph`, routes.getGraph);
app.get(`${path}/graph/:selected`, routes.getGraph);


var server = app.listen(port, function(){
  console.log(`Server running. URL: http://localhost:${port}${path}`);
});

//Socket Setup
var io = socket(server,  {secure: true});
io.origins('*:*')

io.on('connection',function(socket) {

    console.info('Socket connection on server made with socket ID', socket.id);

    socket.on('user', username => {
      activeUsers[socket.id] = username;
    });

    socket.on('user-disconnected', function() {
      delete activeUsers[socket.id];
    });

    socket.on('reconnect_error', function() {
      delete activeUsers[socket.id];
    });

    socket.on('disconnect', function() {
      delete activeUsers[socket.id];
    });
    
    socket.on('join', function(data) {
      socket.join(data.room); //data.room = chatID
      console.log(data.user + ' joined the room : ' + data.room);
      socket.broadcast.to(data.room).emit('new user joined', {user:data.user, message:'has joined this room.'});
    });

    socket.on('leave', function(data){
      console.log(data.user + ' left the room : ' + data.room);
      socket.broadcast.to(data.room).emit('left room', {user:data.user, message:'has left this room.'});
      socket.leave(data.room);
    });

    socket.on('message', async function(data) {     
      let message = {
        chatId: data.room,
        content: data.message,
        creator: data.user,
      };
      message = await routes.db.appendMessage(message);
      io.in(data.room).emit('new message', message);
    })
});
