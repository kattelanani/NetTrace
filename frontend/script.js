const locationOverlay =
    document.getElementById(
        "locationOverlay"
    );


const locationBtn =
    document.getElementById(
        "locationBtn"
    );


const locationStatus =
    document.getElementById(
        "locationStatus"
    );


// ==========================================
// Get Location
// ==========================================

locationBtn.addEventListener(
    "click",
    () => {

        if (!navigator.geolocation) {

            locationStatus.style.display =
                "block";

            locationStatus.textContent =
                "❌ Location is not supported by this browser.";

            return;
        }


        // Disable button while requesting

        locationBtn.disabled = true;

        locationBtn.textContent =
            "📍 Getting Location...";


        locationStatus.style.display =
            "block";

        locationStatus.textContent =
            "Please allow location access when your browser asks.";


        // ==========================================
        // Browser Geolocation
        // ==========================================

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                locationBtn.textContent =
                    "🌍 Finding Location...";


                locationStatus.textContent =
                    "Finding your location...";


                try {

                    // ==========================================
                    // Send coordinates to backend
                    // ==========================================

                    const response =
                        await fetch(
                            "/api/reverse-geocode",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    latitude:
                                        latitude,

                                    longitude:
                                        longitude

                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Location lookup failed."
                        );

                    }


                    // ==========================================
                    // Show Location
                    // ==========================================

                    locationStatus.style.display =
                        "block";


                    locationStatus.textContent =
                        `📍 Location Found

${data.locality}
${data.city}
${data.state}
${data.country}`;


                    locationBtn.textContent =
                        "📍 Location Found";


                    // ==========================================
                    // Hide overlay after a short delay
                    // ==========================================

                    setTimeout(
                        () => {

                            locationOverlay.style.display =
                                "none";

                        },
                        3000
                    );

                }
                catch (error) {

                    console.error(
                        "Location error:",
                        error
                    );


                    locationBtn.disabled =
                        false;


                    locationBtn.textContent =
                        "📍 Try Again";


                    locationStatus.style.display =
                        "block";


                    locationStatus.textContent =
                        "❌ Could not determine your location.";

                }

            },


            // ==========================================
            // Location Error
            // ==========================================

            (error) => {

                console.error(
                    "Geolocation error:",
                    error
                );


                locationBtn.disabled =
                    false;


                locationBtn.textContent =
                    "📍 Get My Location";


                locationStatus.style.display =
                    "block";


                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {

                    locationStatus.textContent =
                        "❌ Location permission was denied.";

                }

                else if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {

                    locationStatus.textContent =
                        "⚠️ Location is currently unavailable.";

                }

                else if (
                    error.code ===
                    error.TIMEOUT
                ) {

                    locationStatus.textContent =
                        "⚠️ Location request timed out.";

                }

                else {

                    locationStatus.textContent =
                        "❌ Unable to get your location.";

                }

            },


            // ==========================================
            // Location Options
            // ==========================================

            {
                enableHighAccuracy: true,

                timeout: 15000,

                maximumAge: 0
            }

        );

    }
);