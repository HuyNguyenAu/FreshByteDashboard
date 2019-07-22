function config(title, time, data) {
    return {
        type: 'line',
        data: {
            labels: time,
            datasets: [
                {
                    type: 'line',
                    label: title,
                    fontSize: 12,
                    yAxisID: "y-axis-0",
                    fill: false,
                    data: data,
                    fontColor: 'rgba(0, 0, 0, 1)',
                    fontSize: 32,
                    borderColor: "rgba(0, 123, 255, 1)",
                    pointBoarderColor: "rgba(0, 123, 255, 1)",
                    backgroundColor: "rgba(0, 123, 255, 0.4)",
                    pointHoverBackgroundColor: "rgba(0, 123, 255, 1)",
                    pointHoverBorderColor: "rgba(0, 123, 255, 1)",
                }]
        },
        options: {
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

function chart(context, title, time_data, data) {
    return new Chart(
        document.getElementById(context).getContext('2d'),
        config(title, time_data, data)
    );
}

$(document).ready(function () {
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

    var temp_chart = chart("temp-chart", "Temperature (Celsius)", time_data, temp_data),
        humidity_chart = chart("humidity-chart", "Humidity (%)", time_data, humidity_data),
        o2_chart = chart("o2-chart", "O2 (%)", time_data, o2_data),
        co2_chart = chart("co2-chart", "CO2 (%)", time_data, co2_data),
        accel_chart = chart("accel-chart", "Accel |m/s^2|", time_data, accel_data),
        shelf_life_chart = chart("shelf-life-chart", "Shelf Life (Days)", time_data, shelf_life_data),
        ethylene_chart = chart("ethylene-chart", "Ethyene pmol/(kgs)", time_data, ethylene_data);

    var webSocket = new WebSocket('wss://' + location.host);
    webSocket.onopen = function () {
        console.log('Successfully connect WebSocket');
    }

    webSocket.onmessage = function (message) {
        console.log('Received message: ' + message.data);
        try {
            var obj = JSON.parse(message.data);
            const maxLen = 100;
            if (!obj.time || !obj.temp || !obj.humidity || !obj.o2 || !obj.co2 || !obj.accel
                || !obj.shelf_life || !obj.ethylene || !obj.lon || !obj.lat) {
                console.log('Message contains unexpected contents: ' + obj);
                return;
            }

            if (obj.time) {
                time_data.push(obj.time);
            }
            if (time_data.length > maxLen) {
                time_data.shift();
            }

            if (obj.temp) {
                document.getElementById("temp").innerHTML = obj.temp + "°C";
                temp_data.push(obj.temp);
            }
            if (temp_data.length > maxLen) {
                temp_data.shift();
            }

            if (obj.humidity) {
                document.getElementById("humidity").innerHTML = obj.humidity + "%";
                humidity_data.push(obj.humidity);
            }
            if (humidity_data.length > maxLen) {
                humidity_data.shift();
            }

            if (obj.o2) {
                document.getElementById("o2").innerHTML = obj.o2 + "%";
                o2_data.push(obj.o2);
            }
            if (o2_data.length > maxLen) {
                o2_data.shift();
            }

            if (obj.co2) {
                document.getElementById("co2").innerHTML = (obj.co2 / 10000.0).toFixed(3) + "%";
                co2_data.push(obj.co2 / 10000.0);
            }
            if (co2_data.length > maxLen) {
                co2_data.shift();
            }

            if (obj.accel) {
                document.getElementById("accel").innerHTML = obj.accel + " |m/s^2|";
                accel_data.push(obj.accel);
            }
            if (accel_data.length > maxLen) {
                accel_data.shift();
            }

            if (obj.shelf_life) {
                document.getElementById("shelf-life").innerHTML = obj.shelflife + ' days';
                shelf_life.push(obj.shelflife);
            }
            if (shelf_life.length > maxLen) {
                shelf_life.shift();
            }

            if (obj.ethylene) {
                document.getElementById("ethylene").innerHTML = obj.ethylene + ' pmol/(kg*s)';
                ethylene_data.push(obj.ethylene);
            }
            if (ethylene_data.length > maxLen) {
                ethylene_data.shift();
            }

            if (obj.lon) {
                document.getElementById("lon").innerHTML = 'Lon: ' + obj.lon;
                lon_data.push(obj.lon);
            }
            if (lon_data.length > maxLen) {
                lon_data.shift();
            }

            if (obj.lat) {
                document.getElementById("lat").innerHTML = 'Lat: ' + obj.lat;
                lat_data.push(obj.lat);
            }
            if (lat_data.length > maxLen) {
                lat_data.shift();
            }

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