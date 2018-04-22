'use strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLID,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    } = require('graphql');

const {getVideoById, getVideos, createVideo} = require('./src/data');
const nodeInterface = require('./src/node');

const PORT = process.env.port || 3000;
const server = express();



const videoType = new GraphQLObjectType({
    name: 'Video',
    description: 'A video on Egghead.io',
    fields: {
        id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'the id of the video'
        },
        title: {
            type: GraphQLString,
            description: 'the title of the video'
        },
        duration: {
            type: GraphQLInt,
            description: 'the length of the video(in seconds)'
        },
        watched: {
            type: GraphQLBoolean,
            description: 'whether the viewer has watched the vido or not'
        }
    },
    interfaces: [nodeInterface],
});

exports.videoType = videoType;

const queryType = new GraphQLObjectType({
    name: 'QueryType',
    description: 'the root query type',
    fields: {
        videos: {
            type: new GraphQLList(videoType),
            resolve: getVideos,
        },
        video: {
            type: videoType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID),
                    description: 'the id of the vidoe'
                },
            },
            resolve: (_, args) => {
                return getVideoById(args.id);
            }
        }
    }
});

const videoInputType = new GraphQLInputObjectType({
    name: 'VideoInput',
    fields: {
        title: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'the title of the video'
        },
        duration: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'the duration of the video(in seconds)'
        },
        released: {
            type: new GraphQLNonNull(GraphQLBoolean),
            description: 'whether or not the video is released'
        },
    },
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'the root Mutation type',
    fields: {
        createVideo: {
            type: videoType,
            args: {
                video: {
                    type: new GraphQLNonNull(videoInputType)
                }
            },
            resolve: (_, args) => {
                return createVideo(args.video)
            }
        }
    }
});

const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType
});

server.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
})
