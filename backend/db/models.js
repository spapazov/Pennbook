const dynamo = require('dynamodb');
const Joi = require('joi');
dynamo.AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    region: process.env.AWS_REGION
});

const User = dynamo.define('User', {
    hashKey: 'username',
    timestamps: true,
    schema: {
        username: Joi.string(),
        password: Joi.string(),
    }
});

const Profile = dynamo.define('Profile',  {
    hashKey: 'username',
    schema: {
        username: Joi.string(),
        fullName: Joi.string(),
        email: Joi.string().email(),
        birthday: Joi.date(),
        about: Joi.string(),
    }
});

const Friend = dynamo.define('Friend', {
    hashKey: 'username',
    rangeKey: 'friend',
    timestamps: true,
    schema: {
        username: Joi.string(),
        friend: Joi.string(),
    }
});

const Affiliation = dynamo.define('Affiliation', {
    hashKey: 'name',
    rangeKey: 'username',
    schema: {
        name: Joi.string(),
        username: Joi.string(),
        type: Joi.string(),
    },
    indexes: [
        {
            hashKey: 'username',
            name: 'UsernameIndex',
            type: 'global',
        }
    ]
});


const Interest = dynamo.define('Interest', {
    hashKey: 'name',
    rangeKey: 'username',
    schema: {
        name: Joi.string(),
        username: Joi.string(),
        type: Joi.string(),
    },
    indexes: [
        {
            hashKey: 'username',
            name: 'UsernameIndex',
            type: 'global',
        }
    ]
});

const Post = dynamo.define('Post', {
    hashKey: 'wall',
    rangeKey: 'postId',
    timestamps: true,
    schema:  {
        wall: Joi.string(),
        postId: dynamo.types.uuid(),
        content: Joi.string(),
        creator: Joi.string(),
        reference: Joi.string(),
        parent: Joi.string(),
        type: Joi.string(),
    },
    indexes: [
        {
            hashKey: 'postId',
            rangeKey: 'createdAt',
            name: 'PostIdIndex',
            type: 'global',
        },
    ]
});

const Reaction = dynamo.define('Reaction', {
    hashKey: 'postId',
    rangeKey: 'username',
    timestamps: true,
    schema: {
        postId: dynamo.types.uuid(),
        username: Joi.string(),
        type: Joi.string(),
    }
});


const SubPost = dynamo.define('SubPost', {
    hashKey: 'postId',
    rangeKey: 'childPostId',
    timestamps: true,
    schema: {
        postId: dynamo.types.uuid(),
        childPostId: dynamo.types.uuid(),
    }
});


const Picture = dynamo.define('Picture', {
    hashKey: 'username',
    rangeKey: 'pictureId',
    timestamps: true,
    schema: {
        username: Joi.string(),
        pictureId: dynamo.types.uuid(),
        identifier: Joi.string(),
    },
    indexes: [
        {
            hashKey: 'pictureId',
            name: 'PictureIdIndex',
            type: 'global',
        }
    ]
});

const PostPicture = dynamo.define('PostPicture', {
    hashKey: 'postId',
    schema: {
        postId: dynamo.types.uuid(),
        pictureId: dynamo.types.uuid(),
    }
});

const Chat = dynamo.define('Chat',  {
    hashKey: 'chatId',
    timestamps: true,
    schema: {
        chatId: dynamo.types.uuid(),
        name: Joi.string(),
    }
});

const UserChat = dynamo.define('UserChat', {
    hashKey: 'username',
    rangeKey: 'chatId',
    schema: {
        username: Joi.string(),
        chatId: dynamo.types.uuid(),
        joined: Joi.date(),
    }, 
    indexes: [
        {
            hashKey: 'chatId',
            name: 'ChatIdIndex',
            type: 'global',
        }
    ]
});

const ChatMessages = dynamo.define('ChatMessages', {
    hashKey: 'chatId',
    rangeKey: 'messageId',
    timestamps: true,
    schema: {
        chatId: dynamo.types.uuid(),
        messageId: dynamo.types.uuid(),
        content: Joi.string(),
        creator: Joi.string(),
    }
});

const AdsorptionResult = dynamo.define('AdsorptionResult', {
    hashKey: 'username1',
    rangeKey: 'username2',
    schema: {
        username1: Joi.string(),
        username2: Joi.string(),
        score: Joi.number(),
    }
});

// Creates all models
if (process.env.CREATE_TABLES === "true") {
    dynamo.createTables(function(err) {
        if (err) {
            console.log('Error creating tables: ', err);
        } else {
            console.log('Tables has been created');
        }
    });
}


module.exports = {
    dynamo: dynamo,
    Affiliation: Affiliation,
    Chat: Chat,
    ChatMessages: ChatMessages,
    Friend: Friend,
    User: User,
    Profile: Profile,
    UserChat: UserChat,
    Post: Post,
    SubPost: SubPost,
    Reaction: Reaction,
    Picture: Picture,
    PostPicture: PostPicture,
    Interest: Interest,
    AdsorptionResult: AdsorptionResult,
};