const express = require('express');
let router = express.Router();

module.exports = function(options) {

    let mqChannel = options.channel;

    if (mqChannel == null) {
        throw err;
    }

    router.get('/:username', (req, res) => {       
        
        let username = req.params.username;

        mqChannel.sendToQueue('requestQueue', Buffer.from(username), {
            persistent: true
        });

        res.send(username);

    });

    return router;

};

