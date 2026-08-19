
console.log(
    "✅ NetTrace precise location system ready"
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
// CHECK VISITOR ID
// =====================================================

if (
    !visitorId ||
    visitorId === "__VISITOR_ID__"
) {

    console.error(
        "❌ Visitor ID is missing!"
    );

}
else {

    console.log(
        "✅ Visitor ID available"
    );

}


// =====================================================
// REQUEST PRECISE GPS LOCATION
// =====================================================

function requestPreciseLocation() {

    console.log(
        "📍 Requesting precise location..."
    );


    if (!navigator.geolocation) {

        console.error(
            "❌ Geolocation is not supported."
        );

        return;

    }


    if (
        !visitorId ||
        visitorId === "__VISITOR_ID__"
    ) {

        console.error(
            "❌ Cannot save location because Visitor ID is missing."
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            console.log(
                "✅ GPS permission granted"
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


            try {

                console.log(
                    "📡 Sending precise location to backend..."
                );


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


                if (data.success) {

                    console.log(
                        "🎉 Precise location saved successfully!"
                    );

                }
                else {

                    console.error(
                        "❌ Precise location was not saved."
                    );

                }

            }
            catch (error) {

                console.error(
                    "❌ Backend request failed:",
                    error
                );

            }

        },


        function (error) {

            console.error(
                "❌ Browser location permission/error:",
                error
            );

        },


        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );

}


// =====================================================
// START LOCATION REQUEST
// =====================================================

requestPreciseLocation();