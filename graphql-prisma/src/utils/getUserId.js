import jwt from 'jsonwebtoken';
// @param request
// @param requireAuth:boolean to indicate if auth should be checked
// @return userId decoded from the jwt
// @description function to parse the authorization token on a request object.
const getUserId = (request, requireAuth = true) => {
    // Extract authorization header
    const header = request.headers.authorization;

    // Attempt to decode/verify the jwt token
    if (header) {
        const token = header.replace('Bearer ', '');
        // Attempt to decode/verify the token against the secret
        const decoded = jwt.verify(token, 'mysupersecret');

        // return userId
        return decoded.userId;
    }

    if (requireAuth) {
        throw new Error('Authentication required');
    }

    return null;
};

export { getUserId as default };
