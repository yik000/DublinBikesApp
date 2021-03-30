let map;

function initMap() {
    //attempting to

    //Set currentInfoWindow to null
    var currentInfoWindow = null;

    // Fetch station data
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {

        // Print data to console
        console.log("data: ", data);

        // Create Map
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 53.349804, lng: -6.260310 },
            zoom: 14,
        });

        // Close currentInfoWindow on map click
        map.addListener("click", () => {
            if(currentInfoWindow !== null){
                currentInfoWindow.close();
            }
        });
        
        // For each station
        data.forEach(station => {
            
            // Create Marker
            const marker = new google.maps.Marker({
                position: {lat: station.position_lat, lng: station.position_long},
                map: map,
            });

            // Add onClick() function to station marker
            marker.addListener("click", () => {
                
                // If open close currentInfoWindow
                if(currentInfoWindow !== null){
                    currentInfoWindow.close();
                }
                
                var banking = "Unavailable";
                if(station.banking == 1){banking = "Available"};
            
                // Create infoWindow for station marker
                var infoWindow = new google.maps.InfoWindow({
                    content:'<h3> ' + station.name + '</h3><b>Stands: </b>' + station.stands + '<br><b>Banking: </b>' + banking
                });
            
                // Open infoWindow and assign to currentInfoWindow
                infoWindow.open(map, marker);
                currentInfoWindow = infoWindow;

                // Create Hourly Availability Chart
                hourlyAvailabilityChart(station.number);

                // Create Daily Availability Chart
                dailyAvailabilityChart(station.number);

            });
    
        });
    
    }).catch(err => {
        console.log("Oops!", err);
    })

}

// Call map function
initMap();

//initialising function for drop down menu for stations
function dropDownStations() {
    // Fetch station data
    fetch("/stations").then(response => {
        return response.json();
    }).then(stationData => {

        console.log(stationData);
        let eachStation = "<select name='station' id='selection' onchange='showStation()' class='select'>" +
                          "<option>Select a Station</option>";
        //for loop to access stations json
        stationData.forEach(station => {

            //input address
            eachStation += "<option value=" + station.number + ">" + station.address + "</option>";
        })

        //call selection id
        document.getElementById('stationSelect').innerHTML = eachStation;

    }).catch(err => {
        console.log("Oops!", err);
    })
}

//Call dropdownstations function
dropDownStations();

//displays the chosen station and displays dynamic data
function showStation() {
    var id = document.getElementById("selection");
    var stationNum = id.value;

    //fetch request from availability table
    fetch("/chosen_station").then(response => {
        return response.json();
    }).then(standData => {

        //forEach to go through each row and filter through it based on the value chosen
        let station;
        standData.forEach(stand => {
            if (stationNum == stand.number) {
                station = stand;
                console.log(station);
            }
        })

        //station info
        let stationInfo = station;
        let address = id.options[id.selectedIndex].text;
        let update = new Date(stationInfo.lastUpdate * 1000);
        let stationTable =
            "<table id='stationTable'>" + "<tr>" +
            "<th>Address</th>" +
            "<th>Status</th>" +
            "<th>Available Bikes</th>" +
            "<th>Available Stands</th>" +
            "<th>Last Updated</th>" + "</tr>" + "<tr>" +
            "<td>" + address + "</td>" +
            "<td>" + stationInfo.status + "</td>" +
            "<td>" + stationInfo.avail_bikes + "</td>" +
            "<td>" + stationInfo.avail_stands + "</td>" +
            "<td>" + update.toUTCString() + "</td>" +
            "</tr>" + "</table>";

        document.getElementById('stationDetails').innerHTML = stationTable;

    }).catch(err => {
        console.log("Oops!", err);
    })
}

// Create Hourly Availability Chart Function
function hourlyAvailabilityChart(stationNum) {

    document.getElementById("hourly_chart").innerHTML = "Loading chart...";

    // Chart styling options
    var chartTitle = 'Average Hourly Availability for station ' + stationNum;
    var options = {
        // Title of chart
        title: chartTitle,
        legend: 'top',
        focusTarget: 'category',
        hAxis: {
            title: 'Hour',
            format: '0.00',
            viewWindow: {
                min: [6, 30, 0],
                max: [20, 30, 0]
            },
            textStyle: {
                fontSize: 14,
                color: '#053061',
                bold: true,
                italic: false
            },
            titleTextStyle: {
                fontSize: 18,
                color: '#053061',
                bold: true,
                italic: false
            }
        },
        vAxis: {
            title: 'Number Available',
            viewWindow: {
                min: [0]
            },
            format: '0',
            textStyle: {
                fontSize: 18,
                color: '#67001f',
                bold: false,
                italic: false
            },
            titleTextStyle: {
                fontSize: 18,
                color: '#67001f',
                bold: true,
                italic: false
            }
        }
    };

    // Generate URL and fetch data
    url = "/hourlyAvailability/" + stationNum
    fetch(url).then(response => {
        return response.json();
    }).then(data => {

        // Print data to console
        console.log("availabilityData: ", data);

        // Create chart
        var chart_data = new google.visualization.DataTable();
        chart_data.addColumn('number', 'Hour');
        chart_data.addColumn('number', 'Bikes');
        chart_data.addColumn('number', 'Stands');
        data.forEach(row => {
            chart_data.addRow([ row.hour, row.avg_bikes, row.avg_stands ]);
        });

        var chart = new google.visualization.ColumnChart(document.getElementById('hourly_chart'));
        chart.draw(chart_data, options)

    });
};



// Create Daily Availability Chart Function
function dailyAvailabilityChart(stationNum) {

    document.getElementById("daily_chart").innerHTML = "Loading chart...";

    // Chart styling options
    var chartTitle = 'Average Daily Availability for station ' + stationNum;
    var options = {
        hAxis: {
            title: 'Day'
          },
          vAxis: {
            title: 'Available'
          },
          colors: ['#a52714', '#097138'],
          crosshair: {
            color: '#000',
            trigger: 'selection'
          }
    };

    // Generate URL and fetch data
    url = "/dailyAvailability/" + stationNum
    fetch(url).then(response => {
        return response.json();
    }).then(data => {

        // Print data to console
        console.log("DailyavailabilityData: ", data);

        // Create chart
        var chart_data = new google.visualization.DataTable();
        chart_data.addColumn('number', 'Day');
        chart_data.addColumn('number', 'Bikes');
        chart_data.addColumn('number', 'Stands');
        data.forEach(row => {
            chart_data.addRow([ row.day, row.avg_bikes, row.avg_stands]);
        });

        var chart = new google.visualization.LineChart(document.getElementById('daily_chart'));
        chart.draw(chart_data, options)
    });
};