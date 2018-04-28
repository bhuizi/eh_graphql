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
const { 
    globalIdField,
    connectionDefinitions,
    connectionFromPromisedArray,
    connectionArgs,
    mutationWithClientMutationId
} = require('graphql-relay');
const {nodeInterface, nodeField} = require('./src/node');

const PORT = process.env.port || 3000;
const server = express();

const videoType = new GraphQLObjectType({
    name: 'Video',
    description: 'A video on Egghead.io',
    fields: {
        id: globalIdField(),
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

const { connectionType: VideoConnection} = connectionDefinitions({
    nodeType: videoType,
    connectionFields: () => ({
        totalCount: {
            type: GraphQLInt,
            description: 'A count of the total number of objects in this connection',
            resolve: (conn) => {
                return conn.edges.length;
            }
        }
    })
});

const queryType = new GraphQLObjectType({
    name: 'QueryType',
    description: 'the root query type',
    fields: {
        node: nodeField,
        videos: {
            type: VideoConnection,
            args: connectionArgs,
            resolve: (_, args) => connectionFromPromisedArray(
                getVideos(),
                args
            )
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

const videoMutation = mutationWithClientMutationId({
    name: 'AddVideo',
    inputFields: {
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
    outputFields: {
        video: {
            type: videoType,
        }
    },
    mutateAndGetPayload: (args) => new Promise((resolve, reject) => {
        Promise.resolve(createVideo(args))
            .then(video => resolve({video}))
            .catch(reject);
    })
})

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'the root Mutation type',
    fields: {
        createVideo: videoMutation
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
