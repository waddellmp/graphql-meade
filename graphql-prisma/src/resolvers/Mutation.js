import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import getUserId from '../utils/getUserId';

const Mutation = {
    async login(
        parent,
        {
            data: { email, password },
        },
        { prisma },
        info
    ) {
        // fetch user async
        const user = await prisma.query.user({
            where: {
                email,
            },
        });

        if (!user) throw new Error('Unable to login error');

        // async compare the hashed password with the password from the client
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) throw new Error('Unable to login');

        // Send back the JWT encoded token with the user.
        // This token will be used to authorize subsequent http requests.
        // TODO: Move this jwt secret to a nodejs environment variable
        return { user, token: jwt.sign({ userId: user.id }, 'mysupersecret') };
    },
    async createUser(parent, args, { prisma }, info) {
        if (args.data.password.length < 8) {
            throw new Error('Password must be 8 characters or longer.');
        }

        // async hash password
        const password = await bcrypt.hash(args.data.password, 10);

        const user = await prisma.mutation.createUser({
            data: {
                ...args.data,
                password,
            },
        });

        // Send back the AuthPayload object with token
        return {
            user,
            token: jwt.sign({ id: user.id }, 'thisisasecret'),
        };
    },
    async deleteUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request);

        return prisma.mutation.deleteUser(
            {
                where: {
                    id: userId,
                },
            },
            info
        );
    },
    async updateUser(parent, { data }, { prisma, request }, info) {
        const userId = getUserId(request);
        return prisma.mutation.updateUser(
            {
                where: { id: userId },
                data,
            },
            info
        );
    },
    async createPost(
        parent,
        {
            data: { title, body, published, author },
        },
        { prisma, request },
        info
    ) {
        // authenticated userId
        const userId = getUserId(request);
        return prisma.mutation.createPost({
            data: {
                title,
                body,
                published,
                author: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    },
    async deletePost(parent, args, { prisma, request }, info) {
        const userId = getUserId(request);

        const postExists = await prisma.exists.Post({
            id: args.id,
            author: {
                id: userId,
            },
        });

        if (!postExists) throw new Error('Unable to delete post');

        return prisma.mutation.deletePost(
            {
                where: {
                    id: args.id,
                },
            },
            info
        );
    },
    async updatePost(
        parent,
        {
            data: { title, body, published },
            id,
        },
        { prisma, request },
        info
    ) {
        const userId = await getUserId(request);

        // Check post exists where the id matches the arg and where the logged in user owns the post
        const postExists = await prisma.exists.Post({
            id,
            author: {
                id: userId,
            },
        });

        if (!postExists) throw new Error('Unable to update post');

        return prisma.mutation.updatePost(
            {
                where: {
                    id,
                },
                data: {
                    body,
                    title,
                    published,
                },
            },
            info
        );
    },
    async createComment(
        parent,
        {
            data: { text, post },
        },
        { prisma, request },
        info
    ) {
        const userId = getUserId(request);

        return prisma.mutation.createComment(
            {
                data: {
                    text,
                    author: {
                        connect: {
                            id: user,
                        },
                    },
                    post: {
                        connect: {
                            id: post,
                        },
                    },
                },
            },
            info
        );
    },
    async deleteComment(parent, { id }, { prisma }, info) {
        const userId = getUserId(request);

        const commentExists = await prisma.exists.Comment({
            id,
            author: {
                id: userId,
            },
        });

        if (!commentExists) throw new Error('Unable to delete comment');

        return prisma.mutation.deleteComment(
            {
                where: {
                    id,
                },
            },
            info
        );
    },
    async updateComment(parent, { id, data }, { prisma, request }, info) {
        const userId = getUserId(request);

        // Query for a comment with id match and where the author id matches the logged in user
        const commentExists = await prisma.exists.Comment({
            id,
            author: {
                id: userId,
            },
        });

        if (!commentExists) throw new Error('Unable to update comment');

        return prisma.mutation.updateComment(
            {
                where: {
                    id,
                },
                data,
            },
            info
        );
    },
};

export default Mutation;
