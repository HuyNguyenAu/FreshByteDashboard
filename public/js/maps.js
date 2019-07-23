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
            document.getElementById("location").innerHTML = "Lon: " + obj.lon + ", Lat: " + obj.lat;
        } catch (err) {
            console.error(err);
        }
    }

    // Azure Maps.
    var map, marker, user_position =  [144.96292, -37.80737];

    //Initialize a map instance.
    map = new atlas.Map('LoadMap', {
        center: user_position,
        //Add your Azure Maps subscription key to the map SDK. Get an Azure Maps key at https://azure.com/maps
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'Ax6CHWnkkH7Zjt1uoQvH8TfBspFTMkPPybuLWF0V8_M'
        }
    });
    //Wait until the map resources are ready.
    map.events.add('ready', function () {
        //Create a HTML marker and add it to the map.
        marker = new atlas.HtmlMarker({
            htmlContent: '<div class="pulseIcon"></div>',
            position: user_position
        });
        map.markers.add(marker);
        //Center the map on the users position.
        map.setCamera({
            center: user_position,
            zoom: 15
        });
    });
});