import { Prisma } from 'prisma-binding';

// Initialize Prisma API constructor from package 'prisma-binding'
// Provides access to the GraphQL API from our backend
// typeDefs is the prisma api generated schema file with mapping
// to each entity and corresponding CRUD operations
const prisma = new Prisma({
    typeDefs: 'src/generated/schema.graphql',
    endpoint: 'http://localhost:4466',
    secret: 'thisismysupersecrettext',
});

export { prisma as default };
