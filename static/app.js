//      <----------------------------- Map ----------------------------->

let map, infoWindow, colorMarkerBike, colorMarkerStand;

function initMap(markerSelection) {

    console.log("MarkerSelection: ", markerSelection);

    //Set currentInfoWindow to null
    var currentInfoWindow = null;

    // Fetch station data
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {

        // Print data to console
        console.log("stationData: ", data);

        // Create Map
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 53.349804, lng: -6.260310 },
            zoom: 14,
        });

        // Create the DIV to hold the marker buttons and call markerSelector()
        const markerSelectorDiv = document.createElement("div");
        markerSelector(markerSelectorDiv, map, markerSelection);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(markerSelectorDiv);

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

            });

            // Add colour markers based on selection
            if (markerSelection == "bikes") {

                // Get percent available
                var percentAvailable = station.avail_bikes / station.stands;

                // Create colour marker based on percent available
                switch (true) {
                    case percentAvailable > 0.8 && percentAvailable <= 1.0:
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
                        break;

                    case percentAvailable > 0.6 && percentAvailable <= 0.8:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#bfe84f",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#bfe84f",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentAvailable > 0.4 && percentAvailable <= 0.6:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#e6ed13",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#e6ed13",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentAvailable > 0.2 && percentAvailable <= 0.4:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#eda413",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#eda413",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentAvailable > 0.0 && percentAvailable <= 0.2:
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
                        break;

                }

            } else {

                // Get percent available
                var percentAvailable = station.avail_stands / station.stands;

                // Create colour marker based on percent available
                switch (true) {
                    case percentAvailable > 0.8 && percentAvailable <= 1.0:
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
                        break;

                    case percentAvailable > 0.6 && percentAvailable <= 0.8:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#bfe84f",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#bfe84f",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentAvailable > 0.4 && percentAvailable <= 0.6:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#e6ed13",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#e6ed13",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentAvailable > 0.2 && percentAvailable <= 0.4:
                        colorMarkerBike = new google.maps.Circle({
                            strokeColor: "#eda413",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#eda413",
                            fillOpacity: 0.35,
                            map: map,
                            center: new google.maps.LatLng(station.position_lat, station.position_long),
                            radius: 50,
                        });
                        break;

                    case percentAvailable > 0.0 && percentAvailable <= 0.2:
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
                        break;

                }

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


// markerSelector function to create buttons
function markerSelector(controlDiv, map, markerSelection){

    // Set CSS for the control border.
    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginTop = "8px";
    controlUI.style.marginLeft = "8px";
    controlUI.style.marginBottom = "22px";
    controlUI.style.textAlign = "center";
    controlUI.title = "Click to recenter the map";
    controlDiv.appendChild(controlUI);

    // Create bike colour markers button
    infoWindow = new google.maps.InfoWindow();
    const bikesButton = document.createElement("button");
    bikesButton.setAttribute("id", "bikesButton");
    bikesButton.textContent = "Bikes";
    bikesButton.classList.add("custom-map-control-button");
    bikesButton.addEventListener("click", () => {

      document.getElementById("map").innerHTML = "Loading map with bike colour markers..."
      initMap("bikes");

    });

    // Create stand colour markers button
    infoWindow = new google.maps.InfoWindow();
    const standsButton = document.createElement("button");
    standsButton.setAttribute("id", "standsButton");
    standsButton.textContent = "Stands";
    standsButton.classList.add("custom-map-control-button");
    standsButton.addEventListener("click", () => {

      document.getElementById("map").innerHTML = "Loading map with stand colour markers..."
      initMap("stands");

    });

    // Add styling for selected button
    if (markerSelection == "bikes") {
        bikesButton.style.backgroundColor= "black";
        bikesButton.style.color= "white";
    } else {
        standsButton.style.backgroundColor= "black";
        standsButton.style.color= "white";
    }

    // Add buttons
    controlUI.appendChild(bikesButton);
    controlUI.appendChild(standsButton);

};


// Call map function
initMap("bikes");


//      <----------------------------- Station-Details (aside) ----------------------------->

//initialising function for drop down menu for stations
function dropDownStations() {
    // Fetch station data
    fetch("/stations").then(response => {
        return response.json();
    }).then(stationData => {

        console.log(stationData);
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
};


// Create form for predicted availability input
function createPredictionForm(stationNum){

    var form_div = document.getElementById("prediction_input");

    // Create form elements
    var heading = document.createElement("h2");
    heading.innerHTML = "Select a date for predicted availability:";

    var form = document.createElement("form");
    form.setAttribute("action", "/predictionInput/" + stationNum);
    form.setAttribute("method", "POST");

    var dt_input = document.createElement("input");
    dt_input.setAttribute("type", "datetime-local");
    dt_input.setAttribute("id", "predict_dt");
    dt_input.setAttribute("name", "predict_dt");

    var submit = document.createElement("input");
    submit.setAttribute("type", "submit");
    submit.setAttribute("value", "Go!");

    // Append elements to form and form to document
    form.appendChild(dt_input);
    form.appendChild(submit);
    form_div.appendChild(heading);
    form_div.appendChild(form);

}