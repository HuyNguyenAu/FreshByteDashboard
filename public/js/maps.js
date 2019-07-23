$(document).ready(function () {
    // Azure Maps.
    var ready = false, user_position_marker, user_position = [18, 5],
        map = new atlas.Map('LoadMap', {
            center: user_position,
            authOptions: {
                authType: 'subscriptionKey',
                subscriptionKey: 'Ax6CHWnkkH7Zjt1uoQvH8TfBspFTMkPPybuLWF0V8_M'
            }
        });

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
            document.getElementById("location").innerHTML = "Lon: " + obj.lon + ", Lat: " + obj.lat;
            user_position = [obj.lon, obj.lat];

            if (ready) {
                map.markers.remove(user_position_marker);
                //Create a HTML marker and add it to the map.
                user_position_marker = new atlas.HtmlMarker({
                    htmlContent: '<div class="pulseIcon"></div>',
                    position: user_position
                });
                map.markers.add(user_position_marker);
                //Center the map on the users position.
                map.setCamera({
                    center: user_position,
                    zoom: 15
                });
            }

        } catch (err) {
            console.error(err);
        }
    }

    map.events.add('ready', function () {
        ready = true;
    });

});