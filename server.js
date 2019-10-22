const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const moment = require('moment');
const path = require('path');
const iotHubClient = require('./IoTHub/iot-hub.js');
const dotenv = require('dotenv');
const app = express();
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

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

// Wait for client to request SQL data.
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        let obj = JSON.parse(message);

        if (obj.tag == "sql") {
            // https://docs.microsoft.com/en-us/azure/sql-database/sql-database-connect-query-nodejs
            // Create connection to database
            var config = {
                authentication: {
                    options: {
                        userName: process.env['Azure.SQL.Database.UserName'],
                        password: process.env['Azure.SQL.Database.Password']
                    },
                    type: 'default'
                },
                server: process.env['Azure.SQL.Database.ServerName'],
                options: {
                    database: process.env['Azure.SQL.Database.DataBase'],
                    encrypt: true
                }
            }
            var connection = new Connection(config);

            // Attempt to connect and execute queries if connection goes through
            connection.on('connect', function(err) {
                if (err) {
                    console.log(err)
                } else {
                    queryDatabase()
                }
            });

            function queryDatabase() {
                console.log('Reading rows from the Table...');

                // Read all rows from table
                var request = new Request(
                    obj.data,
                    function(err, rowCount, rows) {
                        console.log(rowCount + ' row(s) returned');
                        process.exit();
                    }
                );

                request.on('row', function(columns) {
                    let row = {};
                    columns.forEach(function(column) {
                        row[column.metadata.colName] = column.value;
                    });
                    wss.broadcast(JSON.stringify(Object.assign(row, { Tag: "data_analytics" })));
                });

                connection.execSql(request);
            }
        } else if (obj.data == "map_key") {
            wss.broadcast(JSON.stringify({ data: process.env['Azure.Maps.SubscriptionKey'], Tag: 'map_key' }));
        }
    });
});

var iotHubReader = new iotHubClient(process.env['Azure.IoT.IoTHub.ConnectionString'], process.env['Azure.IoT.IoTHub.ConsumerGroup']);
iotHubReader.startReadMessage(function(obj, date) {
    try {
        // date = date || Date.now();
        wss.broadcast(JSON.stringify(Object.assign(obj, { Tag: "dashboard" })));
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