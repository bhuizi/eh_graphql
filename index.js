'use strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLID,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    } = require('graphql');

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
        video: {
            type: videoType,
            resolve: () => new Promise((resolve) => {
                resolve({
                    id: 'a',
                    title: 'GraphQL',
                    duration: 180,
                    watched: false
                })
            })
        }
    }
});

const schema = new GraphQLSchema({
    query: queryType
});

const videoA = {
    id: 'a',
    title: 'Create a GraphQL Schema',
    duration: 120,
    watched: true,
};

const videoB = {
    id: 'b',
    title: 'Ember.js CLI',
    duration: 240,
    watched: false,
};

const videos = [videoA, videoB];


server.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
})
