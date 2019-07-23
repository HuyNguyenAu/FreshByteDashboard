$(document).ready(function () {
    var webSocket = new WebSocket('wss://' + location.host);
    webSocket.onopen = function () {
        console.log('Successfully connect WebSocket');
    }

    webSocket.onmessage = function (message) {
        console.log('Received message: ' + message.data);
        try {
            var obj = JSON.parse(message.data);
            const maxLen = 100;

            // Make sure the MQTT message contains all of the following fields.
            // Else, it's not what we want.
            if (!obj.time || !obj.temp || !obj.humidity || !obj.o2 || !obj.co2 || !obj.accel
                || !obj.shelf_life || !obj.ethylene || !obj.lon || !obj.lat) {
                console.log('Message contains unexpected contents: ' + obj);
                return;
            }

            // Location.
            // !!! Need to figure out a way to better handle location.
            document.getElementById("location").innerHTML = "Lon: " + obj.lon + ", Lat: " + obj.lat;
            if (obj.lon) {
                lon_data.push(obj.lon);
            }
            if (lon_data.length > maxLen) {
                lon_data.shift();
            }

            if (obj.lat) {
                lat_data.push(obj.lat);
            }
            if (lat_data.length > maxLen) {
                lat_data.shift();
            }          
        } catch (err) {
            console.error(err);
        }
    }
});