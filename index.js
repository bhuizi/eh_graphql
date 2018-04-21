'use strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLID,
    GraphQLNonNull,
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    } = require('graphql');

const {getVideoById, getVideos} = require('./src/data');
const PORT = process.env.port || 3000;
const server = express();

const videoType = new GraphQLObjectType({
    name: 'Video',
    description: 'A video on Egghead.io',
    fields: {
        id: {
            type: GraphQLID,
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
    }
});

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

const schema = new GraphQLSchema({
    query: queryType
});

server.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
})
