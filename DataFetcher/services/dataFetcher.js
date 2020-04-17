const axios = require('axios');
const redis = require('redis');
const { promisify} = require('util');

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const setExpire = promisify(client.expire).bind(client);


module.exports = function() {

    let _fetchFromCache = async function(username) {
        const reply = await getAsync(username).catch((err) => { return Promise.reject(err); });
        if (reply != null) {
            await setExpire(username, 600).catch((err) => { return Promise.reject(err); })
        }
        return reply;
    };

    let _fetchFromGitHub = async function(username) {
        const reply = axios.get(`https://api.github.com/users/${username}`).catch((err) => { return Promise.reject(err); });
        return reply;
    };

    let _setToCache = async function(username, value) {
        await setAsync(username, JSON.stringify(value), 'EX', 600).catch((err) => { return Promise.reject(err); });
    };

    return {

        fetchUser: async function(username) {

            let cacheDetails = await _fetchFromCache(username).catch((err) => { throw err; });
            if (cacheDetails != null) {
                return JSON.parse(cacheDetails);
            }

            let { data } = await _fetchFromGitHub(username).catch((err) => { throw err; });
            await _setToCache(username, data);
            return data;
        }

    };
};