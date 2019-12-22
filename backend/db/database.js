const db = require('./models');
const bcrypt = require('bcrypt');
const saltRounds = 10;

function streamToPromise(stream) {
    return new Promise((resolve, reject) => {
        let data = null;
        stream.on("data", chunk => data = chunk);
        stream.on("end", () => resolve(data));
        stream.on("error", error => reject(error));
    });
}

// Create a toJson function for errors, enables easier debugging
if (!('toJSON' in Error.prototype))
    Object.defineProperty(Error.prototype, 'toJSON', {
        value: function () {
            var alt = {
                code: this.code,
                message: this.message,
            };
            return alt;
        },
        configurable: true,
        writable: true
    });

function groupBy(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
}
      

async function getItems(stream) {
    return (await streamToPromise(stream)).Items.map(p => p.attrs);
}

async function getItem(stream) {
    return (await getItems(stream))[0];
}

function login(username, password, callback) {
    db.User.get(username, function (err, user) {
        if (!user) {
            callback("Invalide user / password combination", false);
            return;
        }
        let hash = user.get("password");
        bcrypt.compare(password, hash, function (err, res) {
            if (res === true) {
                callback(null, true);
            } else {
                callback("Invalide user / password combination", false);
            }
        });
    });
}

function changePassword(username, oldPassword, newPassword, callback) {
    db.User.get(username, function (err, user) {
        if (err) {
            callback(err, false);
            return;
        }
        let hash = user.get("password");
        bcrypt.compare(oldPassword, hash, function (err, equal) {
            if (!equal) {
                callback("Old password is invalid");
                return;
            }
            bcrypt.hash(newPassword, saltRounds, function (err, hash) {
                if (err) {
                    callback(err, false);
                    return;
                }
                db.User.update({
                    username: username,
                    password: hash
                }, function (error, createdUser) {
                    if (error) {
                        callback("Setting new password failed", false);
                    }
                    callback(null, true);
                });
            });
        });
    });
}

function signup(user, callback) {
    console.log(user);
    bcrypt.hash(user.password, saltRounds, function (err, hash) {
        if (err) {
            callback(err, false);
            return;
        }
        console.log(user);
        db.User.create({
            username: user.username,
            password: hash
        }, {
            overwrite: false
        }, function (error, createdUser) {
            if (error) {
                console.log(error);
                callback("User already exists", false);
            } else {
                let profile = user.profile;
                profile.username = user.username;
                db.Profile.create(profile, function (error, createdProfile) {
                    if (error) {
                        callback(error, false);
                    } else {
                        callback(null, true);
                    }
                });
            }
        });
    });
}

async function isFriendAsync(user1, user2) {
    if (user1 === user2) {
        return true;
    }

    let items = await getItems(db.Friend.query(user1).where('friend').eq(user2).exec());
    return items.length > 0;
}


function isFriend(user1, user2, callback) {
    if (user1 === user2) {
        callback(null, true);
        return;
    }

    db.Friend.query(user1).where('friend').eq(user2).exec(function (err, result) {
        if (err) {
            callback(err, false);
        } else {
            callback(null, result.Count > 0);
        }
    });
}

async function post(post, callback) {
    try {
        let pictureId = post.pictureId;
        delete post.pictureId;
        let createdPost = await db.Post.create(post);
        if (post.parent) {
            await db.SubPost.create({
                postId: post.parent,
                childPostId: createdPost.get('postId'),
            });
        }
        if (pictureId) {
            await db.PostPicture.create({
                postId: createdPost.get('postId'),
                pictureId: pictureId,
            });
        }
        let result = await mapPost(createdPost.attrs);
        if (callback) {
            callback(null, result);
        }
        return result;  
    } catch (err) {
        if (callback) {
            callback(err, null);
        } else {
            throw err;
        }
    }
}

function reaction(reaction, callback) {
    db.Reaction.create(reaction, function (error, createdReaction) {
        if (error) {
            callback(error, false);
        } else {
            callback(null, true);
        }
    });
}

function removeReaction(reaction, callback) {
    db.Reaction.destroy(reaction, function (error, _) {
        if (error) {
            callback(error, false);
        } else {
            callback(null, true);
        }
    });
}


async function addInterest(user, interest, callback) {
    try {
        interest.username = user;
        await db.Interest.create(interest);
        await post({
            wall: user,
            creator: user,
            reference: interest.name,
            type: 'interest-added',
        });
        callback(null, true);
    } catch (err) {
        callback(err, false);
    }
}

async function removeInterest(user, interestName, callback) {
    try {
        await db.Interest.destroy({ username: user, name: interestName });
        await post({
            wall: user,
            creator: user,
            reference: interestName,
            type: 'interest-removed',
        });
        callback(null, true);
    } catch (err) {
        callback(err, false);
    }
}

async function addAffiliation(user, affiliation, callback) {
    try {
        affiliation.username = user;
        await db.Affiliation.create(affiliation);
        await post({
            wall: user,
            creator: user,
            reference: affiliation.name,
            type: 'affiliation-added',
        });
        callback(null, true);
    } catch (err) {
        callback(err, false);
    }
}


async function removeAffiliation(user, affiliationName, callback) {
    try {
        await db.Affiliation.destroy({ username: user, name: affiliationName });
        await post({
            wall: user,
            creator: user,
            reference: affiliationName,
            type: 'affiliation-removed',
        });
        callback(null, true);
    } catch (err) {
        callback(err, false);
    }
}

function updateProfile(user, profile, callback) {
    profile.username = user;
    db.Profile.update(profile, async function (err, updated) {
        if (err) {
            callback(err, null);
            return;
        }
        if (profile.about) {
            await post({
                wall: user,
                creator: user,
                content: profile.about,
                type: 'about-changed',
            });
        }
        callback(null, updated);
    })
}

function addPicture(username, identifier, callback) {
    db.Picture.create({
        username: username,
        identifier: identifier,
    }, function (err, created) {
        var data = err ? null : created.attrs;
        callback(err, data);
    });
}

async function getInterests(username) {
    return await getItems(db.Interest.query(username).usingIndex('UsernameIndex').loadAll().exec());
}

async function getAffiliations(username) {
    return await getItems(db.Affiliation.query(username).usingIndex('UsernameIndex').loadAll().exec());
}

async function profileAsync(username, includeAll) {
    let profile = await getItem(db.Profile.query(username).exec());
    if (!profile) {
        return {username: username};
    }
    profile.profilePicture = await getProfilePicture(username);
    if (includeAll) {
        profile.interests = await getInterests(username);
        profile.affiliations = await getAffiliations(username);
    }
    return profile;
}

async function profile(username, callback) {
    try {
        let p = await profileAsync(username, true);
        callback(null, p);
    } catch (err) {
        callback(err, null);
    }
}

async function addFriend(username, friend, callback) {
    try {
        await db.Friend.create({
            username: username,
            friend: friend
        });
        await db.Friend.create({
            username: friend,
            friend: username
        });
        // Create posts about new friendship
        await post({
            wall: username,
            creator: username,
            reference: friend,
            type: 'friendship',
        });
        await post({
            wall: friend,
            creator: friend,
            reference: username,
            type: 'friendship',
        });
        callback(null, true);
    } catch (err) {
        callback(err, false);
    }
}

async function getPictureUrl(pictureId) {
    let picture = await getItem(db.Picture.query(pictureId).usingIndex('PictureIdIndex').exec());
    return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${picture.identifier}`;
}

async function getPictureUrlFromPost(post) {
    let postPicture = await getItem(db.PostPicture.query(post.postId).exec());
    if (postPicture !== undefined) {
        return await getPictureUrl(postPicture.pictureId);
    }
    return null;
}

async function getProfilePicture(username) {
    let profilePicturePosts = await getItems(db.Post.query(username).filter('type').equals('profilePicture').loadAll().exec());
    if (profilePicturePosts.length === 0) {
        return null;
    }
    profilePicturePosts = profilePicturePosts.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
    return await getPictureUrlFromPost(profilePicturePosts[0]);
}

async function mapPost(post) {
    post.picture = await getPictureUrlFromPost(post);
    post.creator = await profileAsync(post.creator);
    post.wall = await profileAsync(post.wall);
    post.ready = true;
    post.children = [];
    post.reactions = [];

    if (post.type == "friendship") {
        post.reference = await profileAsync(post.reference, false);
    }
    return post;
}

async function getPost(postId, callback) {
    try {
        let post = await getItem(db.Post.query(postId).usingIndex('PostIdIndex').exec());
        post = await mapPost(post);
         callback(null, post);
    } catch (err) {
        callback(err, null);
    }
 }

 async function getPostChildren(postId, callback) {
    try {
        let children = [];
        let subPosts = await getItems(db.SubPost.query(postId).exec());
        if (subPosts.length !== 0) {
            let subPostIds = subPosts.map(s => s.childPostId);
            children = await getItems(db.Post.scan().where('postId').in(subPostIds).loadAll().exec());
            children = await Promise.all(children.map(async child => await mapPost(child)));
        }
        callback(null, children);
    } catch (err) {
        callback(err, null);
    }
 }

 async function getPostReactions(postId, callback) {
    try {
        let reactions = await getItems(db.Reaction.query(postId).exec());
        callback(null, reactions);
    } catch (err) {
        callback(err, null);
    }
 }

async function posts(walls, callback) {
    try {
        let posts = await getItems(db.Post.scan().where('wall').in(walls).where('parent').null().exec());
        posts = posts.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
        callback(null, posts);
        return posts;
    } catch (err) {
        callback(err, null);
    }
}

async function affiliationWall(name, callback) {
    try {
        let users = (await getItems(db.Affiliation.query(name).exec())).map(e => e.username);
        let data = await posts(users, () => {});
        callback(null, data);
    } catch (err) {
        callback(err, null);
    }
}

async function interestWall(name, callback) {
    try {
        let users = (await getItems(db.Interest.query(name).exec())).map(e => e.username);
        let data = await posts(users, () => {});
        callback(null, data);
    } catch (err) {
        callback(err, null);
    }
}

async function userProfile(user, callback) {
    try {
        let profile = await profileAsync(user, true);
        callback(null, profile);
    } catch (err) {
        callback(err, null);
    }
}


async function userWall(wall, callback) {
    try {
        let userPosts = await posts([wall], () => {});
        callback(null, userPosts);
    } catch (err) {
        callback(err, null);
    }
}

function wall(username, callback) {
    db.Friend.query(username).loadAll().exec(function (err, friends) {
        if (err) {
            callback(err, null);
            return;
        }
        let usernames = [];
        if (friends.Items.length > 0) {
            usernames = friends.Items.map(v => v.get('friend'));
        }
        usernames.push(username);
        posts(usernames, callback);
    });
}

async function getFriendNames(user) {
    let friendships = await getItems(db.Friend.query(user).loadAll().exec());
    return friendships.map(f => f.friend);
}

async function getFriends(username, callback) {
    try {
        let friends = await getFriendNames(username);
        friends = await Promise.all(friends.map(async friend => {
            friend = await profileAsync(friend);
            return friend;
        }));
        callback(null, friends);
    } catch (err) {
        callback(err, null);
    }
}

async function messages(chatId) {
    let messages = await getItems(db.ChatMessages.query(chatId).exec());
    messages = messages.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1);
    return messages;
}

async function appendMessage(message) {
    return (await db.ChatMessages.create(message)).attrs;
}
async function chatParticipants(chatId) {
    return (await getItems(db.UserChat.query(chatId).usingIndex('ChatIdIndex').exec())).map(uc => uc.username);
}

async function chats(user, callback) {
    try {
        let userChats = await getItems(db.UserChat.query(user).exec());
        let chatIds = userChats.map(c => c.chatId);
        let chats = [];
        if (chatIds.length > 0) {
            chats = await getItems(db.Chat.scan().where('chatId').in(chatIds).exec());
            chats = await Promise.all(chats.map(async chat => {
                chat.participants = await chatParticipants(chat.chatId);
                return chat;
            }));
        }
        callback(null, chats);
    } catch (err) {
        callback(err, null);
    }
}

async function leaveChat(user, chatId, callback) {
    try {
        await db.UserChat.destroy({username: user, chatId: chatId});
        callback(null, true);
    } catch {
        callback(err, false);
    }
} 

async function renameChat(chatId, name, callback) {
    try {
        await db.Chat.update({chatId: chatId, name: name});
        callback(null, true);
    } catch {
        callback(err, false);
    }
} 

async function joinChat(user, chatId, callback) {
    try {
        await db.UserChat.create({username: user, chatId: chatId});
        callback(null, true);
    } catch (err) {
        callback(err, false);
    }
} 

async function chat(user, friend, chatId, create, callback) {
    try {
        let chat = null;
        if (chatId) {
            chat = await getItem(db.Chat.query(chatId).exec());
        } else {
            if (!create) {
                // check if exists
                let existingChats = await getItems(db.UserChat.query(user).exec());
                let existingIds = existingChats.map(c => c.chatId);
                let chatsWithFriend = await getItems(db.UserChat.scan().where('username').eq(friend).where('chatId').in(existingIds).exec());
                for (let i = 0; i < chatsWithFriend.length; i++) {
                    let id = chatsWithFriend[i].chatId;
                    let participants = (await chatParticipants(id)).length;
                    if (participants == 2) {
                        chat = await getItem(db.Chat.query(id).exec());
                        break;
                    }
                }
            }
           
            if (chat == null) {
                chat = (await db.Chat.create({ name: "Unnamed" })).attrs;
                await db.UserChat.create({ chatId: chat.chatId, username: user });
                await db.UserChat.create({ chatId: chat.chatId, username: friend });
            }
        }
        chat.user = user;
        chat.messages = await messages(chat.chatId);
        chat.participants = await chatParticipants(chat.chatId);

        callback(null, chat);
    } catch (err) {
        callback(err, null);
    }
}

async function searchUser(user, query, callback) {
    try {
        let users = await getItems(db.Profile.scan().loadAll().exec());
        let result = [];
        query = query.toLowerCase();
        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            let tokens = user.fullName.split(' ');
            tokens.push(user.username);
            tokens.push(user.email);
            tokens = tokens.map(t => t.toLowerCase());

            let match = false;
            for (let j = 0; j < tokens.length; j++) {
                let token = tokens[j];
                if (token.startsWith(query)) {
                    match = true;
                    break;
                }
            }

            if (match) {
                result.push(user);
                user.profilePicture = await getProfilePicture(user.username);
            }
        }
        callback(null, result);
    } catch (err) {
        callback(err, null);
    }

}

async function getGraph(user, selected, callback) {
    try {
        let links = [];
        let nodes = [];

        let userFriends = await getItems(db.Friend.query(user).loadAll().exec());
        let userAffiliations = await getAffiliations(user);
        let visibleAffiliations = userAffiliations.map(a => a.name);
        let userWithCommonAffiliations = await getItems(db.Affiliation.scan().where('name').in(visibleAffiliations).exec());

        let visibleUsers = [user];
        visibleUsers = visibleUsers.concat(userFriends.map(f => f.friend));
        visibleUsers = visibleUsers.concat([...new Set(userWithCommonAffiliations.map(a => a.username))]);

        let selectedUser = user;
        let selectedAffiliation = null;
        let affiliations = null;

        if (selected) {
            let split = selected.split(/-(.+)/);
            let type = split[0];
            if (type === "user") {
                selectedUser = split[1];
            } else if (type === "affiliation") {
                affiliations = await getItems(db.Affiliation.query(split[1]).exec());
                selectedAffiliation = [split[1]];
                visibleAffiliations = [split[1]];
                selectedUser = null;
            }
        }

        let friends = [];
        let friendNames = [];

        if (affiliations == null) {
            affiliations = await getAffiliations(selectedUser);
            visibleAffiliations = affiliations.map(a => a.name).filter(a => visibleAffiliations.includes(a));
            friends = await getItems(db.Friend.query(selectedUser).loadAll().exec());
            friendNames.push(selectedUser);
            friendNames = friendNames.concat(friends.map(a => a.friend));
        } else {
            friends = [];
        }
        friendNames = friendNames.concat(affiliations.map(a => a.username));
        friendNames = [...new Set(friendNames.filter(f => visibleUsers.includes(f)))];

        links = links.concat(friends
            .filter(e => visibleUsers.includes(e.friend))
            .map(e => ({
                id: e.username < e.friend ? `friends-${e.username}-${e.friend}` : `friends-${e.friend}-${e.username}`,
                source: `user-${e.username}`,
                target: `user-${e.friend}`
            })));
        links = links.concat(affiliations
            .filter(a => visibleAffiliations.includes(a.name))
            .map(a => ({
                id: `userAffiliation-${a.username}-${a.name}`,
                source: `user-${a.username}`,
                target: `affiliation-${a.name}`
            })));

        nodes = nodes.concat(friendNames.map(e => ({
            id: `user-${e}`,
            color: e == selectedUser ? 'red' : '#1a71b3',
            label: e
        })));
        nodes = nodes.concat(visibleAffiliations.map(a => ({
            id: `affiliation-${a}`,
            color: a == selectedAffiliation ? 'red' : '#009933',
            label: a
        })));

        return callback(null, {
            nodes: nodes,
            links: links,
        });

    } catch (err) {
        callback(err, null);
    }
}

async function getMapReduceData(directed, preCompute, callback) {
    try {
        let relations = new Set();

        let toString;

        if (directed) {
            toString = (a, b, t) => `${a}\t${b}\t${t}`;
        } else {
            toString = (a, b, t) => a < b ? `${a}\t${b}\t${t}` : `${b}\t${a}\t${t}`;
        }

        if (!preCompute) {
            toString =  (a, b, isAttr) =>  isAttr ? `${a}\t(${b.replace(/\s/g, "_")})` : `${a}\t${b}`;
        }

        let addRelations = (groups, type) => Object.keys(groups).forEach(key => {
            let items = groups[key];
            let users = items.map(i => i.username);
            users.forEach(a => users.forEach(b => {
                if (a != b) {
                    relations.add(toString(a, b, type));
                }
            }));
        });


        let friends = await getItems(db.Friend.scan().loadAll().exec());
        let interests = await getItems(db.Interest.scan().loadAll().exec());
        let affiliations = await getItems(db.Affiliation.scan().loadAll().exec());

        if (preCompute) {
            friends.forEach(f => relations.add(toString(f.username, f.friend, 'f')));
            
            interests = groupBy(interests, 'name');
            affiliations = groupBy(affiliations, 'name');

            addRelations(interests, 'i');
            addRelations(affiliations, 'a');
        } else {
            friends.forEach(f => relations.add(toString(f.username, f.friend, false)));
            interests.forEach(x => relations.add(toString(x.username, x.name, true)));
            affiliations.forEach(x => relations.add(toString(x.username, x.name, true)));
        }


        callback(null, relations);
    } catch (err) {
        callback(err, null);
    }
}

function saveAdsorptionResult(result, callback) {
    db.AdsorptionResult.create(result, callback);
}

async function friendRecommendations(user, callback) {
    try {
        let recommendations = await getItems(db.AdsorptionResult.query(user).exec());
        recommendations = recommendations.sort((a, b) => a.score < b.score ? 1 : -1);
        let friends = await getFriendNames(user);
        recommendations = recommendations.map(r => r.username2).filter(u => !friends.includes(u));
        let result = await Promise.all(recommendations.map(async u => await profileAsync(u, false)));
        callback(null, result);
    } catch (err) {
        callback(err, null);
    }
}

async function userAffiliation(name, callback) {
    try {
        let users = (await getItems(db.Affiliation.query(name).exec())).map(a => a.username);
        let result = await Promise.all(users.map(async u => await profileAsync(u, false)));
        callback(null, result);
    } catch (err) {
        callback(err, null);
    }
}

async function userInterest(name, callback) {
    try {
        let users = (await getItems(db.Interest.query(name).exec())).map(a => a.username);
        let result = await Promise.all(users.map(async u => await profileAsync(u, false)));
        callback(null, result);
    } catch (err) {
        callback(err, null);
    }
}

module.exports = {
    login: login,
    signup: signup,
    post: post,
    reaction: reaction,
    removeReaction: removeReaction,
    userWall: userWall,
    wall: wall,
    addFriend: addFriend,
    addPicture: addPicture,
    isFriend: isFriend,
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
    renameChat: renameChat,
    leaveChat: leaveChat,
    joinChat: joinChat,
    appendMessage: appendMessage,
    searchUser: searchUser,
    getMapReduceData: getMapReduceData,
    saveAdsorptionResult: saveAdsorptionResult,
    friendRecommendations: friendRecommendations,
    userProfile: userProfile,
    getPost,
    getPostChildren,
    getPostReactions,
    interestWall: interestWall,
    affiliationWall: affiliationWall,
    userAffiliation: userAffiliation,
    userInterest: userInterest,
}
