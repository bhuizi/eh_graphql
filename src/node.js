'use strict';

const {
    GraphQLInterfaceType,
    GraphQLNonNull,
    GraphQLID
} = require('graphql');

const { vidoeType } = require('../');

const nodeInterface = new GraphQLInterfaceType({
    name: 'Node',
    fields: {
        id: {
            type: new GraphQLNonNull(GraphQLID),
        },
    },
    resolveType: (object) => {
        if(object.title) {
            return VidoeType
        }
        return null;
    }
});

module.exports = nodeInterface;