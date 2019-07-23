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

            // Update the data and dashboard elements.
            if (obj.time) {
                time_data.push(obj.time);
            }
            if (time_data.length > maxLen) {
                time_data.shift();
            }

            // Temp.
            if (obj.temp) {
                document.getElementById("temp").textContent = obj.temp + "°C";

                if (temp_data.length > 1) {
                    UpdateDelta(delta(obj.temp, temp_data[temp_data.length - 1]), "temp-delta");
                }
                temp_data.push(obj.temp);
            }
            if (temp_data.length > maxLen) {
                temp_data.shift();
            }

            // Humidity.
            if (obj.humidity) {
                document.getElementById("humidity").textContent = obj.humidity + "%";
                if (humidity_data.length > 1) {
                    UpdateDelta(delta(obj.humidity, humidity_data[humidity_data.length - 1]), "humidity-delta");
                }
                humidity_data.push(obj.humidity);
            }
            if (humidity_data.length > maxLen) {
                humidity_data.shift();
            }

            // O2.
            if (obj.o2) {
                document.getElementById("o2").textContent = obj.o2 + "%";
                if (o2_data.length > 1) {
                    UpdateDelta(delta(obj.o2, o2_data[o2_data.length - 1]), "o2-delta");
                }
                o2_data.push(obj.o2);
            }
            if (o2_data.length > maxLen) {
                o2_data.shift();
            }

            // CO2.
            if (obj.co2) {
                document.getElementById("co2").textContent = obj.co2 + "%";
                if (co2_data.length > 1) {
                    ;
                    UpdateDelta(delta(obj.co2, co2_data[co2_data.length - 1]), "co2-delta");
                }
                co2_data.push(obj.co2);
            }
            if (co2_data.length > maxLen) {
                co2_data.shift();
            }

            // Accel.
            if (obj.accel) {
                document.getElementById("accel").textContent = obj.accel + " |m/s^2|";
                if (accel_data.length > 1) {
                    UpdateDelta(delta(obj.accel, accel_data[accel_data.length - 1]), "accel-delta");
                }
                accel_data.push(obj.accel);
            }
            if (accel_data.length > maxLen) {
                accel_data.shift();
            }

            // Shelf life. The arduino figures out the shelf life, not the dashboard.
            if (obj.shelf_life) {
                document.getElementById("shelf-life").textContent = obj.shelf_life + ' days';
                if (shelf_life_data.length > 1) {
                    UpdateDelta(delta(obj.shelf_life, shelf_life_data[shelf_life_data.length - 1]), "shelf-life-delta");
                }
                shelf_life_data.push(obj.shelf_life);
            }
            if (shelf_life_data.length > maxLen) {
                shelf_life_data.shift();
            }

            // Ethylene.
            if (obj.ethylene) {
                document.getElementById("ethylene").textContent = obj.ethylene + ' pmol/(kg*s)';
                if (ethylene_data.length > 1) {
                    UpdateDelta(delta(obj.ethylene, ethylene_data[ethylene_data.length - 1]), "ethylene-delta");
                }
                ethylene_data.push(obj.ethylene);
            }
            if (ethylene_data.length > maxLen) {
                ethylene_data.shift();
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