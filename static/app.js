let map, infoWindow;

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

                // Call getDetails
                getDetails(station.number);

                // Create Daily Availability Chart
                dailyAvailabilityChart(station.number);

            });
    
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
        console.log("DailyavailabilityData: ", data);

        // Create chart
        var chart_data = new google.visualization.DataTable();
        chart_data.addColumn('string', 'Day');
        chart_data.addColumn('number', 'Bikes');
        chart_data.addColumn('number', 'Stands');
        data.forEach(row => {
            chart_data.addRow([ row.day, row.avg_bikes, row.avg_stands]);
        });

        var chart = new google.visualization.LineChart(document.getElementById('daily_chart'));
        chart.draw(chart_data, options)
    });
};