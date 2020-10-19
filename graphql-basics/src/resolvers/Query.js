const Query = {
    me() {
        return {
            id: 'ree2',
            name: 'Matthew Waddell',
            email: 'waddellmp08@gmail.com',
            age: 29,
        };
    },
    post() {
        return {
            id: '4335d',
            title: 'Example Post',
            body: 'This is the post body',
            published: false,
        };
    },
    posts(parent, args, ctx, info) {
        // Teach GraphQL that the posts
        if (!args.query) {
            return ctx.db.posts;
        }

        return ctx.db.posts.filter((post) => {
            var query = args.query.toLowerCase();
            return post.title.toLowerCase().includes(query) || post.body.toLowerCase().includes(query);
        });
    },
    users(parent, args, ctx, info) {
        if (!args.query) {
            return ctx.db.users;
        }

        // Return filtered array where user.name equals the query string provided
        return ctx.db.users.filter((user) => user.name.toLowerCase().includes(args.query.toLowerCase()));
    },
    comments(parent, args, { db }, info) {
        return db.comments;
    },
};

export default Query;
