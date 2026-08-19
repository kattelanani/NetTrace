const locationOverlay = document.getElementById("locationOverlay");
const locationBtn = document.getElementById("locationBtn");
const locationStatus = document.getElementById("locationStatus");

locationBtn.addEventListener("click", () => {

    console.log("📍 Location button clicked");

    if (!navigator.geolocation) {
        locationStatus.style.display = "block";
        locationStatus.textContent =
            "❌ Your browser does not support location.";

        return;
    }

    locationBtn.disabled = true;
    locationBtn.textContent = "📍 Getting Location...";

    locationStatus.style.display = "block";
    locationStatus.textContent =
        "Please allow location access...";

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            console.log("✅ GPS location received");

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);

            locationBtn.textContent =
                "🌍 Finding Location...";

            try {

                const response = await fetch(
                    "/api/reverse-geocode",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            latitude: latitude,
                            longitude: longitude
                        })
                    }
                );

                console.log(
                    "Reverse geocode status:",
                    response.status
                );

                const data = await response.json();

                console.log(
                    "Reverse geocode response:",
                    data
                );

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Reverse geocoding failed"
                    );
                }

                locationStatus.textContent =
                    `📍 Location Found

${data.locality}
${data.city}
${data.state}
${data.country}`;

                locationBtn.textContent =
                    "📍 Location Found";

                setTimeout(() => {
                    locationOverlay.style.display = "none";
                }, 3000);

            }
            catch (error) {

                console.error(
                    "❌ Reverse geocoding error:",
                    error
                );

                locationBtn.disabled = false;

                locationBtn.textContent =
                    "📍 Try Again";

                locationStatus.textContent =
                    "❌ Could not determine your location.";
            }
        },

        (error) => {

            console.error(
                "❌ GPS error:",
                error
            );

            locationBtn.disabled = false;

            locationBtn.textContent =
                "📍 Get My Location";

            locationStatus.style.display =
                "block";

            if (error.code === 1) {

                locationStatus.textContent =
                    "❌ Location permission was denied.";

            }
            else if (error.code === 2) {

                locationStatus.textContent =
                    "⚠️ Location is unavailable.";

            }
            else if (error.code === 3) {

                locationStatus.textContent =
                    "⚠️ Location request timed out.";

            }
            else {

                locationStatus.textContent =
                    "❌ Unable to get your location.";

            }

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
});