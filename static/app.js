let map;

function initMap() {

    //Set currentInfoWindow to null
    var currentInfoWindow = null;

    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        console.log("data: ", data);

        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 53.349804, lng: -6.260310 },
            zoom: 14,
        });


    data.forEach(station => {
        const marker = new google.maps.Marker({
            position: {lat: station.position_lat, lng: station.position_long},
            //label: station.name,
            map: map,
        });

        // Close currentInfoWindow on map click
        map.addListener("click", () => {
            if(currentInfoWindow !== null){
                currentInfoWindow.close();
            }
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
            infowindow.open(map, marker);
            currentInfoWindow = infoWindow;

        });
        
    });

    }).catch(err => {
        console.log("Oops!", err);
    })

}

// Call map function
initMap();
