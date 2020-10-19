const users = [
    {
        id: '1',
        name: 'Matthew',
        email: 'matthew@example.com',
        age: 29,
    },
    {
        id: '2',
        name: 'Julia',
        email: 'julia@example.com',
    },
    {
        id: '3',
        name: 'Carl',
        email: 'carl@example.com',
        age: 33,
    },
];

const comments = [
    {
        id: '1',
        text: 'Comment text for id 1',
        author: '1',
        post: '1',
    },
    {
        id: '2',
        text: 'Comment text for id 2',
        author: '2',
        post: '2',
    },
    {
        id: '3',
        text: 'Comment text for id 3',
        author: '2',
        post: '3',
    },
];

const posts = [
    {
        id: '1',
        title: 'Gone Fishin',
        body: 'Post 1 body',
        published: true,
        author: '1',
        comments: ['1'],
    },
    {
        id: '2',
        title: 'Mojito ditto',
        body: 'Post 2 body',
        published: false,
        author: '1',
        comments: ['2'],
    },
    {
        id: '3',
        title: 'MLS Soccer',
        body: 'FC Dallas is the shiz',
        published: true,
        author: '2',
        comments: ['3'],
    },
];

const db = { posts, comments, users };

export default db;
