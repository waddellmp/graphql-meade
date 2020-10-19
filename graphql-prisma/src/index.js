import { GraphQLServer, PubSub } from 'graphql-yoga';
import db from './db';
import { Query, Mutation, User, Post, Comment, Subscription } from './resolvers';
import prisma from './prisma';
const pubsub = new PubSub();

// Create Server
// typeDefs contains the graphQL type definitions for the GraphQL server running with node.
const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers: { Query, Mutation, User, Post, Comment, Subscription },
    context({ request }) {
        return { db, pubsub, prisma, request };
    },
});

// Start
server.start((options) => {
    console.log(`The server is up. Navigate to http://localhost:${options.port}`);
});
