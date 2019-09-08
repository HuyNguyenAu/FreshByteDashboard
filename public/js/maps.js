$(document).ready(function() {
    // Azure Maps.
    var ready = false,
        user_position_marker,
        user_position = [144.96292, -37.80737],
        map,
        controls = [];

    var webSocket = new WebSocket('wss://' + location.host);
    webSocket.onopen = function() {
        console.log('Successfully connect WebSocket');
        // Get maps subscription key.
        webSocket.send("maps");
    }

    webSocket.onmessage = function(message) {
        // Setup maps when key received.
        if (message.data.includes('Azure.Maps.SubscriptionKey ')) {
            map = new atlas.Map('map', {
                center: user_position,
                authOptions: {
                    authType: 'subscriptionKey',
                    subscriptionKey: message.data.replace(/Azure.Maps.SubscriptionKey\s/, "").replace(/"/g, '')
                },
                enableAccessibility: true,
            });

            function addControls() {
                map.controls.remove(controls);
                controls = [];
                var controlStyle = "light";
                // Zoom.
                controls.push(new atlas.control.ZoomControl({
                    zoomDelta: 1,
                    style: controlStyle
                }));
                map.controls.add(controls, {
                    position: "top-right"
                });
            }

            map.events.add('ready', function() {
                //Add controls to the map.
                map.controls.add(
                    new BringDataIntoViewControl({
                        units: 'metric'
                    }), {
                        position: 'top-left'
                    });

                ready = true;
            });
            map.events.add('ready', addControls);

        } else {
            console.log('Received message: ' + message.data);
        }

        try {
            var obj = JSON.parse(message.data);
            const maxLen = 100;

            // Make sure the MQTT message contains all of the following fields.
            if (!obj.Time || !obj.Temp || !obj.Humidity || !obj.O2 || !obj.CO2 || !obj.Accel ||
                !obj.ShelfLife || !obj.Ethylene || !obj.Lon || !obj.Lat) {
                console.log('Message contains unexpected contents!');
                return;
            }

            // Location.
            document.getElementById("location").innerHTML = "Lon: " + obj.Lon + " Lat: " + obj.Lat;

            // !!! IDK if this is the best way to implement live tracking.
            if (ready) {
                map.markers.remove(user_position_marker);
                user_position_marker = new atlas.HtmlMarker({
                    htmlContent: '<div class="pulseIcon"></div>',
                    position: [obj.Lon, obj.Lat]
                });
                map.markers.add(user_position_marker);
            }

        } catch (err) {
            console.error(err);
        }
    }
});