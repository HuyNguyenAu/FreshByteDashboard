var time_data = [],
    temp_data = [],
    humidity_data = [],
    o2_data = [],
    co2_data = [],
    accel_data = [],
    shelf_life_data = [],
    ethylene_data = [];

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
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toPrecision
        document.getElementById(id_max).textContent = "Max " + Math.max.apply(Math, data).toPrecision(4) + " " + units;
        document.getElementById(id_min).textContent = "Min " + Math.min.apply(Math, data).toPrecision(4) + " " + units;
    }
}

// Find average value of array.
// https://www.jstips.co/en/javascript/array-average-and-median/
function Average(data) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    var sum = data.reduce((previous, current) => current += previous);
    return (sum / data.length).toPrecision(4);
}

// Search
// https://www.w3schools.com/howto/howto_js_filter_table.asp
function Search() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("table");
    tr = table.getElementsByTagName("tr");
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 1; i < tr.length; i++) {
        // Search the whole row (row elements).
        for (j = 0; j < tr[i].getElementsByTagName("td").length; j++) {
            td = tr[i].getElementsByTagName("td")[j];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                    break;
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }
}

// Get table ids.
function GetIDs() {
    var input, filter, table, tr, td, i, txtValue, ids = [];
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("table");
    tr = table.getElementsByTagName("tr");
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 1; i < tr.length; i++) {
        if (tr[i].style.display == "") {
            var td = tr[i].getElementsByTagName("td").item(0);
            ids.push(td.textContent || td.innerText);
        }
    }

    return ids;
}

// Filter Charts.
function FilterCharts() {
    var time_data_f = [],
        temp_data_f = [],
        humidity_data_f = [],
        o2_data_f = [],
        co2_data_f = [],
        accel_data_f = [],
        shelf_life_data_f = [],
        ethylene_data_f = [];

    GetIDs().forEach(x => {
        time_data_f.push(time_data[x]);
        temp_data_f.push(temp_data[x]);
        humidity_data_f.push(humidity_data[x]);
        o2_data_f.push(o2_data[x]);
        co2_data_f.push(co2_data[x]);
        accel_data_f.push(accel_data[x]);
        shelf_life_data_f.push(shelf_life_data[x]);
        ethylene_data_f.push(ethylene_data[x]);
    });

    var temp_chart_f = chart("temp-chart", "Temperature (Celsius)", time_data_f, temp_data_f, "rgba(255, 99, 132, 1)", "rgba(255, 99, 132, 0.4)"),
        humidity_chart_f = chart("humidity-chart", "Humidity (%)", time_data_f, humidity_data_f, "rgba(54, 162, 235, 1)", "rgba(54, 162, 235, 0.4)"),
        o2_chart_f = chart("o2-chart", "O2 (%)", time_data_f, o2_data_f, "rgba(75, 192, 192, 1)", "rgba(75, 192, 192, 0.4)"),
        co2_chart_f = chart("co2-chart", "CO2 (%)", time_data_f, co2_data_f, "rgba(145, 97, 242, 1)", "rgba(145, 97, 242, 0.4)"),
        accel_chart_f = chart("accel-chart", "Accel |m/s^2|", time_data_f, accel_data_f, "rgba(255, 205, 86, 1)", "rgba(255, 205, 86, 0.4)"),
        shelf_life_chart_f = chart("shelf-life-chart", "Shelf Life (Days)", time_data_f, shelf_life_data_f, "rgba(255, 201, 14, 1)", "rgba(255, 201, 14, 0.4)"),
        ethylene_chart_f = chart("ethylene-chart", "Ethyene pmol/(kgs)", time_data_f, ethylene_data_f, "rgba(128, 64, 64, 1)", "rgba(128, 64, 64, 0.4)");

    // Update the charts to reflect data array changes.
    temp_chart_f.update();
    humidity_chart_f.update();
    o2_chart_f.update();
    co2_chart_f.update();
    accel_chart_f.update();
    shelf_life_chart_f.update();
    ethylene_chart_f.update();

}

$(document).ready(function() {
    const maxLen = 100;

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
        // Call server to send SQL data first 100 entries.
        webSocket.send(JSON.stringify({ data: "select * from Telemetry order by Time offset 0 row fetch first 100 row only", tag: "sql" }));
    }

    // Update the data arrays and dashboard elements to latest MQTT message received.
    // Keep the code complexity out of the dashboard.
    // The dashboard only displays the information received, arduino does the pre-processing.
    // !!! Need a better way to handle the repeated code blocks below.
    webSocket.onmessage = function(message) {
        try {
            var obj = JSON.parse(message.data);

            console.log('Received message: ' + message.data);

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
            if (obj.Time) {
                time_data.push(obj.Time);
            }
            if (time_data.length > maxLen) {
                time_data.shift();
            }

            // Temp.
            if (obj.Temp) {
                temp_data.push(obj.Temp);
            }
            if (temp_data.length > maxLen) {
                temp_data.shift();
            }

            // Humidity.
            if (obj.Humidity) {
                humidity_data.push(obj.Humidity);
            }
            if (humidity_data.length > maxLen) {
                humidity_data.shift();
            }

            // O2.
            if (obj.O2) {
                o2_data.push(obj.O2);
            }
            if (o2_data.length > maxLen) {
                o2_data.shift();
            }

            // CO2.
            if (obj.CO2) {
                co2_data.push(obj.CO2);
            }
            if (co2_data.length > maxLen) {
                co2_data.shift();
            }

            // Accel.
            if (obj.Accel) {
                accel_data.push(obj.Accel);
            }
            if (accel_data.length > maxLen) {
                accel_data.shift();
            }

            // Shelf life. The arduino figures out the shelf life, not the dashboard.
            if (obj.ShelfLife) {
                shelf_life_data.push(obj.ShelfLife);
            }
            if (shelf_life_data.length > maxLen) {
                shelf_life_data.shift();
            }

            // Ethylene.
            if (obj.Ethylene) {
                ethylene_data.push(obj.Ethylene);
            }
            if (ethylene_data.length > maxLen) {
                ethylene_data.shift();
            }

            document.getElementById("temp").textContent = Average(temp_data) + "°C";
            UpdateMaxMin(temp_data, "temp-max", "temp-min", "°C");

            document.getElementById("humidity").textContent = Average(humidity_data) + "%";
            UpdateMaxMin(humidity_data, "humidity-max", "humidity-min", "%");

            document.getElementById("o2").textContent = Average(o2_data) + "%";
            UpdateMaxMin(o2_data, "o2-max", "o2-min", "%");

            document.getElementById("co2").textContent = Average(co2_data) + " ppm";
            UpdateMaxMin(co2_data, "co2-max", "co2-min", "ppm");

            document.getElementById("accel").textContent = Average(accel_data) + " |m/s^2|";
            UpdateMaxMin(accel_data, "accel-max", "accel-min", "|m/s^2|");

            document.getElementById("shelf-life").textContent = Average(shelf_life_data) + ' days';
            UpdateMaxMin(shelf_life_data, "shelf-life-max", "shelf-life-min", "days");

            UpdateMaxMin(ethylene_data, "ethylene-max", "ethylene-min", "pmol/(kg*s)");
            document.getElementById("ethylene").textContent = Average(ethylene_data) + ' pmol/(kg*s)';

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
            row.insertCell(0).innerHTML = count;
            row.insertCell(1).innerHTML = obj.Time;
            row.insertCell(2).innerHTML = obj.Temp;
            row.insertCell(3).innerHTML = obj.Humidity;
            row.insertCell(4).innerHTML = obj.O2;
            row.insertCell(5).innerHTML = obj.CO2;
            row.insertCell(6).innerHTML = obj.Accel;
            row.insertCell(7).innerHTML = obj.ShelfLife;
            row.insertCell(8).innerHTML = obj.Lon;
            row.insertCell(9).innerHTML = obj.Lat;
        } catch (err) {
            console.error(err);
        }
    }

    $("#search").keyup(function() {
        Search();
        FilterCharts();
    });
});