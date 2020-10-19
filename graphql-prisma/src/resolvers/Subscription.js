const Subscription = {
    comment: {
        subscribe(parent, { id }, { prisma }, info) {
            return prisma.subscription.comment(
                {
                    where: {
                        node: {
                            post: {
                                id,
                            },
                        },
                    },
                },
                info
            );
        },
    },
    post: {
        subscribe(parent, args, { prisma }, info) {
            return prisma.subscription.post(
                {
                    where: {
                        node: {
                            published: true,
                        },
                    },
                },
                info
            );
        },
    },
};

export { Subscription as default };
