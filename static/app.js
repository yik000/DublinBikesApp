//      <----------------------------- Map ----------------------------->

let map, infoWindow, colorMarkerBike, colorMarkerStand;

function initMap() {

    //Set current time, nightTime and dayTime hours
    let currentTime = new Date();
    let nightTime = new Date();
    nightTime.setHours(20, 0, 0);
    let dayTime = new Date();
    dayTime.setDate(dayTime.getDate() + 1);
    dayTime.setHours(6, 50, 0)

    //Set currentInfoWindow to null
    var currentInfoWindow = null;


    // Fetch station data
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {

        // Print data to console
        console.log("stationData: ", data);

        // Create Map in night mode between 7:30pm and 6:50am
        if (currentTime >= nightTime && currentTime < dayTime ) {
            map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 53.349804, lng: -6.260310 },
                zoom: 14,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "geometry",
                        stylers: [{ color: "#263c3f" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#6b9a76" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#38414e" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#212a37" }],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#9ca5b3" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry",
                        stylers: [{ color: "#746855" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#1f2835" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#f3d19c" }],
                    },
                    {
                        featureType: "transit",
                        elementType: "geometry",
                        stylers: [{ color: "#2f3948" }],
                    },
                    {
                        featureType: "transit.station",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#17263c" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#515c6d" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.stroke",
                        stylers: [{ color: "#17263c" }],
                    },
                ],
            });
        }

        //Create Map in daytime anytime before 7pm
        else {
            map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 53.349804, lng: -6.260310 },
                zoom: 14,
            });
        }

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
                    + '<br><b>Available Bikes: </b>' + station.avail_bikes + '<br><b>Available Stands: </b>' + station.avail_stands
                });

                // Open infoWindow and assign to currentInfoWindow
                infoWindow.open(map, marker);
                currentInfoWindow = infoWindow;

                // Call getDetails
                getDetails(station.number);

                // Create Daily Availability Chart
                dailyAvailabilityChart(station.number);

            });

            //Adding a colour marker on each station that has available bikes - green for > 0
            if (station.avail_bikes > 0) {
                colorMarkerBike = new google.maps.Circle({
                    strokeColor: "#00D100",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#00D100",
                    fillOpacity: 0.35,
                    map: map,
                    center: new google.maps.LatLng(station.position_lat, station.position_long),
                    radius: 50,
                });
            }

            //Adding a colour marker on each station that has no available bikes - red for == 0
            if (station.avail_bikes == 0) {
                colorMarkerBike = new google.maps.Circle({
                    strokeColor: "#B20000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#B20000",
                    fillOpacity: 0.35,
                    map: map,
                    center: new google.maps.LatLng(station.position_lat, station.position_long),
                    radius: 50,
                });
            }

            //Adding a colour marker on each station that available stands - green for > 0
            if (station.avail_stands > 0) {
                colorMarkerStand = new google.maps.Circle({
                    strokeColor: "#00A300",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#00A300",
                    fillOpacity: 0.35,
                    map: map,
                    center: new google.maps.LatLng(station.position_lat, station.position_long),
                    radius: 60,
                });
            }

            //Adding a colour marker on each station that no available stands - red if == 0
            if (station.avail_stands == 0) {
                colorMarkerStand = new google.maps.Circle({
                    strokeColor: "#ED0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#ED0000",
                    fillOpacity: 0.35,
                    map: map,
                    center: new google.maps.LatLng(station.position_lat, station.position_long),
                    radius: 60,
                });
            }

        });

      
        // Add Geolocation services
        infoWindow = new google.maps.InfoWindow();
        const locationButton = document.createElement("button");
        locationButton.textContent = "Pan to Current Location";
        locationButton.classList.add("custom-map-control-button");
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
        locationButton.addEventListener("click", () => {

          // Try HTML5 geolocation
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                infoWindow.setPosition(pos);
                infoWindow.setContent("Location found.");
                infoWindow.open(map);
                map.setCenter(pos);
              },
              () => {
                handleLocationError(true, infoWindow, map.getCenter());
              }
            );
          } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
          }
        });

    }).catch(err => {
        console.log("Oops!", err);
    })


    //creating the current weather info and putting it on the map
    fetch("/weather_info").then(response => {
        return response.json();
    }).then(data => {
        console.log(data[0]);

    }).catch(err => {
        console.log("Oops!", err);
    })
}

// Call map function
initMap();


//      <----------------------------- Station-Details (aside) ----------------------------->

//initialising function for drop down menu for stations
function dropDownStations() {
    // Fetch station data
    fetch("/stations").then(response => {
        return response.json();
    }).then(stationData => {

        let eachStation = "<select name='station' id='selection' onchange='getDetails(this.value)' class='select'>" +
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


// Details function
function getDetails(stationNum){

    // Empty divs and print loading message
    document.getElementById('stationDetails').innerHTML = "Loading details...";
    document.getElementById('hourly_chart').innerHTML = "";
    document.getElementById('daily_chart').innerHTML = "";

    // Call all details functions
    showStation(stationNum)
    hourlyAvailabilityChart(stationNum)
    dailyAvailabilityChart(stationNum)
};


//displays the chosen station and displays dynamic data
function showStation(stationNum) {

    // Generate URL and fetch request from availability table
    url = "/chosen_station/" + stationNum;
    fetch(url).then(response => {
        return response.json();
    }).then(responseData => {

        // Extract station info -> first (only) item in the response list
        let stationInfo = responseData[0];

        // Print data to console
        console.log("station" + stationNum + "_LastAvailability: ", stationInfo);

        // Create station info table
        let update = new Date(stationInfo.lastUpdate);
        let stationTable =
            "<table id='stationTable'>" + "<tr>" +
            "<th>Address</th>" +
            "<th>Status</th>" +
            "<th>Available Bikes</th>" +
            "<th>Available Stands</th>" +
            "<th>Last Updated</th>" + "</tr>" + "<tr>" +
            "<td>" + stationInfo.address + "</td>" +
            "<td>" + stationInfo.status + "</td>" +
            "<td>" + stationInfo.avail_bikes + "</td>" +
            "<td>" + stationInfo.avail_stands + "</td>" +
            "<td>" + update.toLocaleString() + "</td>" +
            "</tr>" + "</table>";

        document.getElementById('stationDetails').innerHTML = stationTable;

    }).catch(err => {
        console.log("Oops!", err);
    })
}

// Create Hourly Availability Chart Function
function hourlyAvailabilityChart(stationNum) {

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
        console.log("station" + stationNum + "_hourlyAvailabilityData: ", data);

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

    // Chart styling options
    var chartTitle = 'Average Daily Availability for station ' + stationNum;
    var options = {
        // Title of chart
        title: chartTitle,
        legend: 'top',
        focusTarget: 'category',

        hAxis: {
            textStyle: {
                fontSize: 8,
                color: '#053061',
                bold: true,
                italic: false,
            },
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
    url = "/dailyAvailability/" + stationNum
    fetch(url).then(response => {
        return response.json();
    }).then(data => {

        // Print data to console
        console.log("station" + stationNum + "_dailyAvailabilityData: ", data);

        // Create chart
        var chart_data = new google.visualization.DataTable();
        chart_data.addColumn('string', 'Day');
        chart_data.addColumn('number', 'Bikes');
        chart_data.addColumn('number', 'Stands');
        data.forEach(row => {
            chart_data.addRow([row.day, row.avg_bikes, row.avg_stands]);
        });

        var chart = new google.visualization.LineChart(document.getElementById('daily_chart'));
        chart.draw(chart_data, options)
    });
}