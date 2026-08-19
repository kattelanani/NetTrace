console.log("✅ NetTrace script loaded");

const locationBtn =
    document.getElementById("locationBtn");

const locationStatus =
    document.getElementById("locationStatus");

console.log("Location button:", locationBtn);


// ==========================================
// Location Button
// ==========================================

if (locationBtn) {

    locationBtn.addEventListener(
        "click",
        function () {

            console.log(
                "📍 Location button clicked"
            );


            // ==========================================
            // Check Browser Geolocation Support
            // ==========================================

            if (!navigator.geolocation) {

                console.error(
                    "❌ Browser does not support geolocation"
                );

                return;
            }


            // ==========================================
            // Disable Button
            // ==========================================

            locationBtn.disabled = true;

            locationBtn.textContent =
                "📍 Getting Location...";


            console.log(
                "🌍 Requesting browser location permission..."
            );


            // ==========================================
            // Get GPS Location
            // ==========================================

            navigator.geolocation.getCurrentPosition(

                async function (position) {

                    console.log(
                        "✅ GPS location received"
                    );


                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    console.log(
                        "Latitude:",
                        latitude
                    );

                    console.log(
                        "Longitude:",
                        longitude
                    );


                    // ==========================================
                    // Send Coordinates to Backend
                    // ==========================================

                    try {

                        console.log(
                            "📡 Sending location to backend..."
                        );


                        const response =
                            await fetch(
                                "/api/reverse-geocode",
                                {

                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({

                                            latitude:
                                                latitude,

                                            longitude:
                                                longitude

                                        })

                                }
                            );


                        console.log(
                            "Backend response:",
                            response.status
                        );


                        // ==========================================
                        // Check HTTP Response
                        // ==========================================

                        if (!response.ok) {

                            throw new Error(
                                "Backend returned HTTP " +
                                response.status
                            );

                        }


                        const data =
                            await response.json();


                        console.log(
                            "Backend response received:",
                            data
                        );


                        // ==========================================
                        // Success
                        // ==========================================

                        if (
                            data.success === true
                        ) {

                            console.log(
                                "✅ Location successfully processed"
                            );


                            // Hide status

                            if (locationStatus) {

                                locationStatus.textContent =
                                    "";

                                locationStatus.style.display =
                                    "none";

                            }


                            // Hide location button

                            locationBtn.style.display =
                                "none";

                        }
                        else {

                            throw new Error(
                                "Backend could not process location"
                            );

                        }

                    }
                    catch (error) {

                        console.error(
                            "❌ Backend location error:",
                            error
                        );


                        // Re-enable button

                        locationBtn.disabled =
                            false;

                        locationBtn.textContent =
                            "📍 Get My Location";

                    }

                },


                // ==========================================
                // GPS Error
                // ==========================================

                function (error) {

                    console.error(
                        "❌ GPS error"
                    );

                    console.error(
                        "Error code:",
                        error.code
                    );

                    console.error(
                        "Error message:",
                        error.message
                    );


                    locationBtn.disabled =
                        false;

                    locationBtn.textContent =
                        "📍 Get My Location";


                    // ==========================================
                    // IMPORTANT
                    //
                    // Don't show location information
                    // to visitor.
                    // ==========================================

                    if (locationStatus) {

                        locationStatus.textContent =
                            "";

                        locationStatus.style.display =
                            "none";

                    }

                },


                // ==========================================
                // GPS Options
                // ==========================================

                {

                    enableHighAccuracy: true,

                    timeout: 30000,

                    maximumAge: 0

                }

            );

        }
    );

}
else {

    console.error(
        "❌ locationBtn was not found!"
    );

}