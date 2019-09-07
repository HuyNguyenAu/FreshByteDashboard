const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const moment = require('moment');
const path = require('path');
const iotHubClient = require('./IoTHub/iot-hub.js');
const dotenv = require('dotenv');
const app = express();
const mysql = require('mysql');

dotenv.config();

app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res /*, next*/ ) {
    res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            try {
                console.log('sending data ' + data);
                client.send(data);
            } catch (e) {
                console.error(e);
            }
        }
    });
};

var iotHubReader = new iotHubClient(process.env['Azure.IoT.IoTHub.ConnectionString'], process.env['Azure.IoT.IoTHub.ConsumerGroup']);
iotHubReader.startReadMessage(function(obj, date) {
    try {
        console.log(date);
        date = date || Date.now()
        wss.broadcast(JSON.stringify(Object.assign(obj, { Time: moment.utc(date).format('YYYY:MM:DD[T]HH:mm:ss') })));
    } catch (err) {
        console.log(obj);
        console.error(err);
    }
});

var port = normalizePort(process.env.PORT || '3000');
server.listen(port, function listening() {
    console.log('Listening on %d', server.address().port);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

setTimeout(function() {
    var config = {
        host: process.env['Azure.SQL.Database.ServerName'],
        user: process.env['Azure.SQL.Database.UserName'],
        password: process.env['Azure.SQL.Database.Password'],
        database: process.env['Azure.SQL.Database.DataBase'],
        port: 3306,
        ssl: true
    };

    const conn = new mysql.createConnection(config);

    conn.connect(
        function(err) {
            if (err) {
                wss.broadcast(JSON.stringify("!!! Cannot connect !!! Error:"));
                throw err;
            } else {
                wss.broadcast(JSON.stringify("Connection established."));
                readData();
            }
        });

    function readData() {
        conn.query('SELECT * FROM Telemetry',
            function(err, results, fields) {
                if (err) throw err;
                else console.log('Selected ' + results.length + ' row(s).');
                for (i = 0; i < results.length; i++) {
                    wss.broadcast(JSON.stringify(results[i]));
                }
                wss.broadcast(JSON.stringify('Done.'));
            })
        conn.end(
            function(err) {
                if (err) throw err;
                else wss.broadcast(JSON.stringify('Closing connection.'))
            });
    };
}, 1000);