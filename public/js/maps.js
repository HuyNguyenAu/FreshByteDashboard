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
    var map, data_source;

    //Initialize a map instance.
    map = new atlas.Map('LoadMap', {
        //Add your Azure Maps subscription key to the map SDK. Get an Azure Maps key at https://azure.com/maps
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'Ax6CHWnkkH7Zjt1uoQvH8TfBspFTMkPPybuLWF0V8_M'
        }
    });
    //Wait until the map resources are ready.
    map.events.add('ready', function () {
        //Create a data source and add it to the map.
        datasource = new atlas.source.DataSource();
        map.sources.add(datasource);
        //Create a circle from a Point feature by providing it a subType property set to "Circle" and radius property.
        var userPosition = [144.96292, -37.80737];
        var userPoint = new atlas.data.Point(userPosition)
        //Add a point feature with Circle properties to the data source for the users position. This will be rendered as a polygon.
        datasource.add(new atlas.data.Feature(userPoint, {
            subType: "Circle",
            radius: 100
        }));
        //Add the users position point.
        datasource.add(userPoint);

        map.layers.add([
            //Create a polygon layer~ to render the filled in area of the accuracy circle for the users position.
            new atlas.layer.PolygonLayer(datasource, null, {
                fillColor: 'rgba(0, 153, 255, 0.5)'
            }),
            //Create a symbol layer to render the users position on the map.
            new atlas.layer.SymbolLayer(datasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
            })
        ]);
        //Center the map on the users position.
        map.setCamera({
            center: userPosition,
            zoom: 15
        });
    });
});