import { GraphQLServer, PubSub } from 'graphql-yoga';
import db from './db';
import { Query, Mutation, User, Post, Comment, Subscription } from './resolvers';

const pubsub = new PubSub();

// Create Server
const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers: { Query, Mutation, User, Post, Comment, Subscription },
    context: { db, pubsub },
});

// Start
server.start(() => {
    console.log('The server is up.');
});
