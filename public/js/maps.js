$(document).ready(function () {
    // Azure Maps.
    var ready = false, user_position_marker, user_position = [144.96292, -37.80737],
        map = new atlas.Map('LoadMap', {
            center: user_position,
            authOptions: {
                authType: 'subscriptionKey',
                subscriptionKey: 'Ax6CHWnkkH7Zjt1uoQvH8TfBspFTMkPPybuLWF0V8_M'
            },
            enableAccessibility: true,
        }), controls = [];

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

            // !!! IDK if this is the best way to implement live tracking.
            user_position = [obj.lon, obj.lat];

            if (ready) {
                map.markers.remove(user_position_marker);
                user_position_marker = new atlas.HtmlMarker({
                    htmlContent: '<div class="pulseIcon"></div>',
                    position: user_position
                });
                map.markers.add(user_position_marker);
            }

        } catch (err) {
            console.error(err);
        }
    }

    function addControls() {
        map.controls.remove(controls);
        controls = [];
        var controlStyle = "light";
        // Zoom.
        controls.push(new atlas.control.ZoomControl({
            zoomDelta: 1,
            style: controlStyle
        }));
        // Pitch.
        controls.push(new atlas.control.PitchControl({
            pitchDegreesDelta: 5,
            style: controlStyle
        }));
        // Rotate.
        controls.push(new atlas.control.CompassControl({
            rotationDegreesDelta: 10,
            style: controlStyle
        }));
        // Theme.
        controls.push(new atlas.control.StyleControl({
            style: controlStyle
        }));
        map.controls.add(controls, {
            position: "top-right"
        });
    }

    map.events.add('ready', function () {
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
});