const crypto = require('crypto');
const messages = []; // This should be replaced with a proper database in production

exports.handler = async function(event, context) {
    if (event.httpMethod === 'POST') {
        const { message } = JSON.parse(event.body);
        messages.push(message);
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } else if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            body: JSON.stringify({ messages }),
        };
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
};
