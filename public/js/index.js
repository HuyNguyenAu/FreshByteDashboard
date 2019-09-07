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

// Calculate the percentange change. 
function Delta(new_value, old_value) {
    return Math.round((1 - (old_value / new_value)) * 100);
}

// Change the delta values and the colour accordingly.
function UpdateDelta(delta_value, id) {
    document.getElementById(id).textContent = delta_value + "%";

    if (delta_value < 0) {
        document.getElementById(id).style.backgroundColor = "#E64759";
    } else {
        document.getElementById(id).style.backgroundColor = "#1BC98E";
    }
}

// Okay this is really bad. I need to fix this.
// var ws = new WebSocket('wss://' + location.host);
// ws.onopen = function() {
//     console.log('Successfully connect WebSocket');
// }

// ws.onmessage = function(data) {
//     console.log(data);
// }

$(document).ready(function() {
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
    }

    webSocket.broadcast = function broadcast(data) {
        webSocket.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    console.log('Requesting' + data);
                    client.send(data);
                } catch (e) {
                    console.error(e);
                }
            }
        });
    };

    webSocket.broadcast(JSON.stringify("sql"));

    // Update the data arrays and dashboard elements to latest MQTT message received.
    // Keep the code complexity out of the dashboard.
    // The dashboard only displays the information received, arduino does the pre-processing.
    // !!! Need a better way to handle the repeated code blocks below.
    webSocket.onmessage = function(message) {
        console.log('Received message: ' + message.data);
        console.log('Received message: ' + message);
        try {
            var obj = JSON.parse(message.data);
            const maxLen = 100;

            // Make sure the MQTT message contains all of the following fields.
            // Else, it's not what we want.
            // if (!obj.time || !obj.Temp || !obj.Humidity || !obj.O2 || !obj.CO2 || !obj.Accel ||
            //     !obj.ShelfLife || !obj.Ethylene || !obj.Lon || !obj.Lat) {
            //     console.log('Message contains unexpected contents: ' + obj.error);
            //     return;
            // }

            // Update the data and dashboard elements.
            if (obj.Time) {
                time_data.push(obj.Time);
            }
            if (time_data.length > maxLen) {
                time_data.shift();
            }

            // Temp.
            if (obj.Temp) {
                document.getElementById("temp").textContent = obj.Temp + "°C";

                if (temp_data.length > 1) {
                    UpdateDelta(Delta(obj.Temp, temp_data[temp_data.length - 1]), "temp-delta");
                }
                temp_data.push(obj.Temp);
            }
            if (temp_data.length > maxLen) {
                temp_data.shift();
            }

            // Humidity.
            if (obj.Humidity) {
                document.getElementById("humidity").textContent = obj.Humidity + "%";
                if (humidity_data.length > 1) {
                    UpdateDelta(Delta(obj.Humidity, humidity_data[humidity_data.length - 1]), "humidity-delta");
                }
                humidity_data.push(obj.Humidity);
            }
            if (humidity_data.length > maxLen) {
                humidity_data.shift();
            }

            // O2.
            if (obj.O2) {
                document.getElementById("o2").textContent = obj.O2 + "%";
                if (o2_data.length > 1) {
                    UpdateDelta(Delta(obj.O2, o2_data[o2_data.length - 1]), "o2-delta");
                }
                o2_data.push(obj.O2);
            }
            if (o2_data.length > maxLen) {
                o2_data.shift();
            }

            // CO2.
            if (obj.CO2) {
                document.getElementById("co2").textContent = obj.CO2 + " ppm";
                if (co2_data.length > 1) {;
                    UpdateDelta(Delta(obj.CO2, co2_data[co2_data.length - 1]), "co2-delta");
                }
                co2_data.push(obj.CO2);
            }
            if (co2_data.length > maxLen) {
                co2_data.shift();
            }

            // Accel.
            if (obj.Accel) {
                document.getElementById("accel").textContent = obj.Accel + " |m/s^2|";
                if (accel_data.length > 1) {
                    UpdateDelta(Delta(obj.Accel, accel_data[accel_data.length - 1]), "accel-delta");
                }
                accel_data.push(obj.Accel);
            }
            if (accel_data.length > maxLen) {
                accel_data.shift();
            }

            // Shelf life. The arduino figures out the shelf life, not the dashboard.
            if (obj.ShelfLife) {
                document.getElementById("shelf-life").textContent = obj.ShelfLife + ' days';
                if (shelf_life_data.length > 1) {
                    UpdateDelta(Delta(obj.ShelfLife, shelf_life_data[shelf_life_data.length - 1]), "shelf-life-delta");
                }
                shelf_life_data.push(obj.ShelfLife);
            }
            if (shelf_life_data.length > maxLen) {
                shelf_life_data.shift();
            }

            // Ethylene.
            if (obj.Ethylene) {
                document.getElementById("ethylene").textContent = obj.Ethylene + ' pmol/(kg*s)';
                if (ethylene_data.length > 1) {
                    UpdateDelta(Delta(obj.Ethylene, ethylene_data[ethylene_data.length - 1]), "ethylene-delta");
                }
                ethylene_data.push(obj.Ethylene);
            }
            if (ethylene_data.length > maxLen) {
                ethylene_data.shift();
            }

            // Location.
            // !!! Need to figure out a way to better handle location.
            document.getElementById("location").innerHTML = "Lon: " + obj.Lon + ", Lat: " + obj.Lat;
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
        } catch (err) {
            console.error(err);
        }
    }
});