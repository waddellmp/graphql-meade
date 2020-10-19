import { v4 as uuidv4 } from 'uuid';

const Mutation = {
    createUser(parent, args, ctx, info) {
        // create update delete
        const emailTaken = ctx.db.users.some((user) => user.email === args.data.email);

        if (emailTaken) {
            throw new Error('User email taken');
        }

        const user = {
            id: uuidv4(),
            ...args.data,
        };

        ctx.db.users.push(user);

        return user;
    },
    deleteUser(parent, args, ctx, info) {
        const userIndex = ctx.db.users.findIndex((user) => user.id === args.id);

        if (userIndex < 0) throw new Error('Invalid operation');

        // Remove user from users
        const deletedUser = ctx.db.users.splice(userIndex, 1)[0];

        // Remove user posts
        var postIdsToRemove = ctx.db.posts
            .filter((post) => post.author === args.id)
            .map((post) => post.id)
            .forEach((postId) => {
                let index = ctx.db.posts.findIndex((post) => post.id === postId);
                ctx.db.posts.splice(index, 1);
            });

        // Remove user comments
        var commentIdsToRemove = ctx.db.comments
            .filter((comment) => comment.author === args.id)
            .map((comment) => comment.id)
            .forEach((commentId) => {
                let index = ctx.db.comments.findIndex((comment) => comment.id === commentId);
                ctx.db.comments.splice(index, 1);
            });
        return deletedUser;
    },
    updateUser(parent, { id, data }, { db }, info) {
        const user = db.users.find((user) => user.id === id);

        if (!user) throw new Error('User not found');

        // Update the email field if the value is string type and value is different than persisted email
        if (typeof data.email === 'string' && user.email !== data.email) {
            const emailTaken = db.users.some((user) => user.email === data.email);

            if (emailTaken) {
                throw new Error('Email taken');
            }

            user.email = data.email;
        }

        if (typeof data.name === 'string' && data.name.toLowerCase() !== user.name.toLowerCase()) {
            user.name = data.name;
        }
        // Age is nullable therefore we don't need to run an update
        if (typeof data.age !== 'undefined') {
            user.age = data.age;
        }

        return user;
    },
    createPost(parent, args, { db, pubsub }, info) {
        const userExists = db.users.some((user) => user.id === args.data.author);

        if (!userExists) throw new Error('User not found');

        const post = {
            id: uuidv4(),
            ...args.data,
        };
        db.posts.push(post);

        if (args.data.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'CREATE',
                    data: post,
                },
            });
        }

        return post;
    },
    deletePost(parent, args, { db, pubsub }, info) {
        const postIndex = db.posts.findIndex((post) => post.id === args.id);

        if (postIndex < 0) throw new Error('Post not found');

        const [post] = db.posts.splice(postIndex, 1);

        // only publish post deletion when published is true
        // no need to push draft post deletion to clients
        if (post.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'DELETE',
                    data: post,
                },
            });
        }
        if (post.comments.length > 0) {
            db.comments.forEach((comment, index, collection) => {
                if (comment.post === args.id) collection.splice(index, 1);
            });
        }

        return post;
    },
    updatePost(parent, args, { db, pubsub }, info) {
        const post = db.posts.find((post) => post.id === args.id);
        const originalPost = { ...post };

        if (!post) throw new Error('Post not found');

        if (typeof args.data.title === 'string') {
            post.title = args.data.title;
        }
        if (typeof args.data.body === 'string') {
            post.body = args.data.body;
        }

        // Check if args.data.published is null or boolean
        if (typeof args.data.published === 'boolean') {
            post.published = args.data.published;

            if (originalPost.published && !post.published) {
                // Fire deleted event
                // Send back unchanged post to prevent changes in other fields from showing up on delete
                pubsub.publish('post', {
                    post: {
                        mutation: 'DELETED',
                        data: originalPost,
                    },
                });
            } else if (!originalPost.published && post.published) {
                // Fire created event
                pubsub.publish('post', {
                    post: {
                        mutation: 'CREATED',
                        data: post,
                    },
                });
            }
        }
        // If published is unchanged (not supplied to args) then fire the update event
        else if (post.published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'UPDATED',
                    data: post,
                },
            });
        }

        return post;
    },
    createComment(parent, args, { db, pubsub }, info) {
        const userExists = db.users.some((user) => user.id === args.data.author);
        const postExistsAndIsPublished = db.posts.some((post) => post.id === args.data.post && post.published);

        if (!userExists) throw new Error("Author doesn't exist");

        if (!postExistsAndIsPublished) throw new Error("Post doesn't exist or is not published");

        const comment = {
            id: uuidv4(),
            ...args.data,
        };

        db.comments.push(comment);

        // Call pubsub.publish()
        pubsub.publish(`comment ${args.data.post}`, {
            comment: {
                mutation: 'CREATED',
                data: comment,
            },
        });

        return comment;
    },
    deleteComment(parent, args, { db, pubsub }, info) {
        const commentIndex = db.comments.findIndex((comment) => comment.id === args.id);

        if (commentIndex < 0) throw new Error('Comment not found');

        const [comment] = db.comments.splice(commentIndex, 1);

        pubsub.publish(`comment ${comment.post}`, {
            comment: {
                mutation: 'DELETED',
                data: comment,
            },
        });

        return comment;
    },
    updateComment(parent, { id, data }, { db, pubsub }, info) {
        const comment = db.comments.find((comment) => comment.id === id);
        if (!comment) {
            throw new Error('No comment found');
        }

        if (typeof data.text === 'string') {
            comment.text = data.text;
            pubsub.publish(`comment ${comment.post}`, {
                comment: {
                    mutation: 'UPDATED',
                    data: comment,
                },
            });
        }
    },
};

export default Mutation;
