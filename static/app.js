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
            "<h2>" + address + "</h2>" +
            "<h3>Status</h3>" +
            "<p>" + stationInfo.status + "</p>" +
            "<h3>Available Bikes</h3>" +
            "<p>" + stationInfo.avail_bikes + "</p>" +
            "<h3>Available Stands</h3>" +
            "<p>" + stationInfo.avail_stands + "</p><br>" +
            "<p>Last Updated: " + update.toUTCString() + "</p>";

        document.getElementById('stationDetails').innerHTML = stationTable;

    }).catch(err => {
        console.log("Oops!", err);
    })
}
