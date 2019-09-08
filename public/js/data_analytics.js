// Create config with specified parameters, keeps the core code simple.
function config(title, time, data, primary_colour, background_colour) {
    return {
        type: 'line',
        data: {
            labels: time,
            datasets: [{
                type: 'line',
                label: title,
                fontSize: 12,
                yAxisID: "y-axis-0",
                fill: true,
                data: data,
                fontColor: 'rgba(0, 0, 0, 1)',
                fontSize: 32,
                borderColor: primary_colour,
                pointBoarderColor: primary_colour,
                backgroundColor: background_colour,
                pointHoverBackgroundColor: primary_colour,
                pointHoverBorderColor: primary_colour,
            }]
        },
        options: {
            // Low and high values will clip. Need to add padding to fix it.
            layout: {
                padding: {
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5
                }
            },
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    display: false
                }],
                xAxes: [{
                    display: false
                }]
            }
        }
    };
}

// Create chart with custom config, keeps the core code simple.
function chart(context, title, time_data, data, primarty_colour, background_colour) {
    return new Chart(
        document.getElementById(context).getContext('2d'),
        config(title, time_data, data, primarty_colour, background_colour)
    );
}

// Update max and min values
function UpdateMaxMin(data, id_max, id_min, units) {
    if (data.length > 1) {
        document.getElementById(id_max).textContent = "Max " + Math.max.apply(Math, data) + " " + units;
        document.getElementById(id_min).textContent = "Max " + Math.min.apply(Math, data) + " " + units;
    }
}

$(document).ready(function() {
    const maxLen = 100;
    var time_data = [],
        temp_data = [],
        humidity_data = [],
        o2_data = [],
        co2_data = [],
        accel_data = [],
        shelf_life_data = [],
        ethylene_data = [],
        lon_data = [],
        lat_data = [];

    var temp_chart = chart("temp-chart", "Temperature (Celsius)", time_data, temp_data, "rgba(255, 99, 132, 1)", "rgba(255, 99, 132, 0.4)"),
        humidity_chart = chart("humidity-chart", "Humidity (%)", time_data, humidity_data, "rgba(54, 162, 235, 1)", "rgba(54, 162, 235, 0.4)"),
        o2_chart = chart("o2-chart", "O2 (%)", time_data, o2_data, "rgba(75, 192, 192, 1)", "rgba(75, 192, 192, 0.4)"),
        co2_chart = chart("co2-chart", "CO2 (%)", time_data, co2_data, "rgba(145, 97, 242, 1)", "rgba(145, 97, 242, 0.4)"),
        accel_chart = chart("accel-chart", "Accel |m/s^2|", time_data, accel_data, "rgba(255, 205, 86, 1)", "rgba(255, 205, 86, 0.4)"),
        shelf_life_chart = chart("shelf-life-chart", "Shelf Life (Days)", time_data, shelf_life_data, "rgba(255, 201, 14, 1)", "rgba(255, 201, 14, 0.4)"),
        ethylene_chart = chart("ethylene-chart", "Ethyene pmol/(kgs)", time_data, ethylene_data, "rgba(128, 64, 64, 1)", "rgba(128, 64, 64, 0.4)");

    var webSocket = new WebSocket('wss://' + location.host + '/');
    webSocket.onopen = function() {
        console.log('Successfully connect WebSocket');
        // Call server to send SQL data.
        webSocket.send("sql");
    }

    // Azure Maps.
    var ready = false,
        user_position_marker,
        user_position = [144.96292, -37.80737],
        map,
        controls = [];
    // Update the data arrays and dashboard elements to latest MQTT message received.
    // Keep the code complexity out of the dashboard.
    // The dashboard only displays the information received, arduino does the pre-processing.
    // !!! Need a better way to handle the repeated code blocks below.
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
            if (obj.Tag != "data_analytics") {
                return;
            }

            // Make sure the MQTT message contains all of the following fields.
            if (!obj.Time || !obj.Temp || !obj.Humidity || !obj.O2 || !obj.CO2 || !obj.Accel ||
                !obj.ShelfLife || !obj.Ethylene || !obj.Lon || !obj.Lat || !obj.Tag) {
                console.log('Message contains unexpected contents: ' + message.data);
                return;
            }

            // Update the data and dashboard elements.
            // !!! IDK if this is the best way to implement live tracking.
            if (ready) {
                map.markers.remove(user_position_marker);
                user_position_marker = new atlas.HtmlMarker({
                    htmlContent: '<div class="pulseIcon"></div>',
                    position: [obj.Lon, obj.Lat]
                });
                map.markers.add(user_position_marker);
            }

            if (obj.Time) {
                time_data.push(obj.Time);
            }
            if (time_data.length > maxLen) {
                time_data.shift();
            }

            // Temp.
            if (obj.Temp) {
                document.getElementById("temp").textContent = obj.Temp + "°C";
                temp_data.push(obj.Temp);
                UpdateMaxMin(temp_data, "temp-max", "temp-min", "°C");
            }
            if (temp_data.length > maxLen) {
                temp_data.shift();
            }

            // Humidity.
            if (obj.Humidity) {
                document.getElementById("humidity").textContent = obj.Humidity + "%";
                humidity_data.push(obj.Humidity);
                UpdateMaxMin(humidity_data, "humidity-max", "humidity-min", "%");
            }
            if (humidity_data.length > maxLen) {
                humidity_data.shift();
            }

            // O2.
            if (obj.O2) {
                document.getElementById("o2").textContent = obj.O2 + "%";
                o2_data.push(obj.O2);
                UpdateMaxMin(o2_data, "o2-max", "o2-min", "%");
            }
            if (o2_data.length > maxLen) {
                o2_data.shift();
            }

            // CO2.
            if (obj.CO2) {
                document.getElementById("co2").textContent = obj.CO2 + " ppm";
                co2_data.push(obj.CO2);
                UpdateMaxMin(co2_data, "co2-max", "co2-min", "ppm");
            }
            if (co2_data.length > maxLen) {
                co2_data.shift();
            }

            // Accel.
            if (obj.Accel) {
                document.getElementById("accel").textContent = obj.Accel + " |m/s^2|";
                accel_data.push(obj.Accel);
                UpdateMaxMin(accel_data, "accel-max", "accel-min", "|m/s^2|");
            }
            if (accel_data.length > maxLen) {
                accel_data.shift();
            }

            // Shelf life. The arduino figures out the shelf life, not the dashboard.
            if (obj.ShelfLife) {
                document.getElementById("shelf-life").textContent = obj.ShelfLife + ' days';
                shelf_life_data.push(obj.ShelfLife);
                UpdateMaxMin(shelf_life_data, "shelf-life-max", "shelf-life-min", "days");
            }
            if (shelf_life_data.length > maxLen) {
                shelf_life_data.shift();
            }

            // Ethylene.
            if (obj.Ethylene) {
                document.getElementById("ethylene").textContent = obj.Ethylene + ' pmol/(kg*s)';
                ethylene_data.push(obj.Ethylene);
                UpdateMaxMin(ethylene_data, "ethylene-max", "ethylene-min", "pmol/(kg*s)");
            }
            if (ethylene_data.length > maxLen) {
                ethylene_data.shift();
            }

            // Location.
            if (obj.Lon) {
                lon_data.push(obj.Lon);
            }
            if (lon_data.length > maxLen) {
                lon_data.shift();
            }

            if (obj.Lat) {
                lat_data.push(obj.Lat);
            }
            if (lat_data.length > maxLen) {
                lat_data.shift();
            }

            // Update the charts to reflect data array changes.
            temp_chart.update();
            humidity_chart.update();
            o2_chart.update();
            co2_chart.update();
            accel_chart.update();
            shelf_life_chart.update();
            ethylene_chart.update();

            // Update table.
            var row = document.getElementById("table").insertRow(-1);
            row.insertCell(0).innerHTML = obj.Time;
            row.insertCell(1).innerHTML = obj.Temp;
            row.insertCell(2).innerHTML = obj.Humidity;
            row.insertCell(3).innerHTML = obj.O2;
            row.insertCell(4).innerHTML = obj.CO2;
            row.insertCell(5).innerHTML = obj.Accel;
            row.insertCell(6).innerHTML = obj.ShelfLife;
            row.insertCell(7).innerHTML = obj.Lon;
            row.insertCell(8).innerHTML = obj.Lat;

        } catch (err) {
            console.error(err);
        }
    }
});
()