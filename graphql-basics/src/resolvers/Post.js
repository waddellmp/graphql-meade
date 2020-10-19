// Setup a relationship for Post -> User
const Post = {
    author(parent, args, ctx, info) {
        return ctx.db.users.find((user) => user.id === parent.author);
    },
    comments(parent, args, ctx, info) {
        return ctx.db.comments.filter((comment) => comment.post === parent.id);
    },
};

export default Post;
