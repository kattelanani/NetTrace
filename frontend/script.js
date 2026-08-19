console.log("✅ NetTrace script loaded");

const locationBtn =
    document.getElementById("locationBtn");

const locationStatus =
    document.getElementById("locationStatus");

console.log(
    "Location button:",
    locationBtn
);


if (locationBtn) {

    locationBtn.addEventListener(
        "click",
        function () {

            console.log(
                "📍 Location button clicked"
            );


            if (!navigator.geolocation) {

                console.log(
                    "❌ Geolocation not supported"
                );

                return;
            }


            locationBtn.disabled = true;

            locationBtn.textContent =
                "📍 Getting Location...";


            navigator.geolocation.getCurrentPosition(

                async function (position) {

                    console.log(
                        "✅ GPS location received"
                    );


                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    try {

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
                            "Reverse geocode status:",
                            response.status
                        );


                        const data =
                            await response.json();


                        console.log(
                            "Location processed successfully"
                        );


                        /*
                         * IMPORTANT:
                         *
                         * We DO NOT show:
                         *
                         * city
                         * state
                         * country
                         * locality
                         *
                         * to the visitor.
                         */


                        // Remove location status text

                        if (locationStatus) {

                            locationStatus.textContent =
                                "";

                            locationStatus.style.display =
                                "none";

                        }


                        // Remove button after successful request

                        locationBtn.style.display =
                            "none";


                    }
                    catch (error) {

                        console.error(
                            "❌ Location processing error:",
                            error
                        );


                        /*
                         * Don't show technical
                         * location information
                         * to the visitor.
                         */


                        locationBtn.disabled =
                            false;

                        locationBtn.textContent =
                            "📍 Get My Location";

                    }

                },


                function (error) {

                    console.error(
                        "❌ GPS error:",
                        error
                    );


                    locationBtn.disabled =
                        false;

                    locationBtn.textContent =
                        "📍 Get My Location";


                    /*
                     * We don't display the
                     * actual location/error
                     * information to the visitor.
                     */

                },


                {
                    enableHighAccuracy: true,

                    timeout: 15000,

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