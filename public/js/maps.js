$(document).ready(function() {
    const maxLen = 100;

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
        webSocket.send(JSON.stringify({ data: "map_key", tag: "map_key" }));
    }

    webSocket.onmessage = function(message) {
        try {
            var obj = JSON.parse(message.data);

            // Setup maps when key received.
            if (obj.Tag == "map_key") {
                map = new atlas.Map('map', {
                    center: user_position,
                    authOptions: {
                        authType: 'subscriptionKey',
                        subscriptionKey: obj.data.replace(/Azure.Maps.SubscriptionKey\s/, "").replace(/"/g, '')
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
                    //Create a pitch control and add it to the map.
                    controls.push(new atlas.control.PitchControl({
                        pitchDegreesDelta: 0,
                        style: controlStyle
                    }));
                    //Create a compass control and add it to the map.
                    controls.push(new atlas.control.CompassControl({
                        rotationDegreesDelta: 0,
                        style: controlStyle
                    }));
                    //Create a style control and add it to the map.
                    controls.push(new atlas.control.StyleControl({
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

            // Only accept objects with the dashboard tag.
            if (obj.Tag != "dashboard") {
                return;
            }

            // Make sure the MQTT message contains all of the following fields.
            if (!obj.Time || !obj.Temp || !obj.Humidity || !obj.O2 || !obj.CO2 || !obj.Accel ||
                !obj.ShelfLife || !obj.Ethylene || !obj.Lon || !obj.Lat || !obj.Tag) {
                console.log('Message contains unexpected contents: ' + message.data);
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