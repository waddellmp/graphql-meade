import getUserId from '../utils/getUserId';

const Query = {
    async me(parent, args, { prisma, request }, info) {
        const userId = getUserId(request, true);

        return prisma.query.user({
            where: {
                id: userId,
            },
        });
    },
    async post(parent, args, { prisma, request }, info) {
        // Get authenticated userID
        const userId = getUserId(request);

        const posts = await prisma.query.posts(
            {
                where: {
                    id: args.id,
                    OR: [
                        {
                            published: true,
                        },
                        {
                            author: {
                                id: userId,
                            },
                        },
                    ],
                },
            },
            info
        );

        if (posts.length === 0) {
            throw new Error('Post not found');
        }

        return posts[0];
    },
    posts(parent, args, { prisma }, info) {
        const opArgs = {
            where: {
                published: true,
            },
        };
        if (args.query) {
            opArgs.where.OR = [
                {
                    title_contains: args.query,
                },
                {
                    body_contains: args.query,
                },
            ];
        }
        return prisma.query.posts(opArgs, info);
    },
    users(parent, args, { db, prisma }, info) {
        const opArgs = {};

        if (args.query) {
            // Build where clause
            opArgs.where = {
                OR: [
                    {
                        name_contains: args.query,
                    },
                    {
                        email: args.query,
                    },
                ],
            };
        }
        return prisma.query.users(opArgs, info);
    },
    comments(parent, args, { db, prisma }, info) {
        return prisma.query.comments(null, info);
    },
};

export default Query;
