console.log(
    "✅ NetTrace location system ready"
);


// ======================================================
// GET ELEMENTS
// ======================================================

const locationOverlay =
    document.getElementById(
        "locationOverlay"
    );


const allowLocationBtn =
    document.getElementById(
        "allowLocationBtn"
    );


const denyLocationBtn =
    document.getElementById(
        "denyLocationBtn"
    );


const locationStatus =
    document.getElementById(
        "locationStatus"
    );


// ======================================================
// VISITOR ID
// ======================================================

const visitorId =
    window.NETTRACE_VISITOR_ID;


console.log(
    "🆔 Visitor ID:",
    visitorId
);


// ======================================================
// ALLOW
// ======================================================

if (allowLocationBtn) {

    allowLocationBtn.addEventListener(
        "click",
        async function () {

            console.log(
                "🟢 ALLOW BUTTON CLICKED"
            );


            // ==========================================
            // CHECK ID
            // ==========================================

            if (
                !visitorId ||
                visitorId ===
                "__VISITOR_ID__"
            ) {

                console.error(
                    "❌ Visitor ID is missing!"
                );

                return;

            }


            // ==========================================
            // BUTTON STATE
            // ==========================================

            allowLocationBtn.disabled =
                true;

            denyLocationBtn.disabled =
                true;

            allowLocationBtn.textContent =
                "Processing...";


            console.log(
                "📡 Calling backend..."
            );


            // ==========================================
            // BACKEND REQUEST
            // ==========================================

            try {

                const response =
                    await fetch(
                        "/api/allow-approximate-location",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    visitorId:
                                        visitorId

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


                // ==========================================
                // SUCCESS
                // ==========================================

                if (
                    response.ok &&
                    data.success
                ) {

                    console.log(
                        "✅ Approximate location saved"
                    );


                    // Hide popup

                    if (locationOverlay) {

                        locationOverlay.style.display =
                            "none";

                    }


                    return;

                }


                // ==========================================
                // FAILED
                // ==========================================

                console.error(
                    "❌ Backend returned an error"
                );


                allowLocationBtn.disabled =
                    false;

                denyLocationBtn.disabled =
                    false;

                allowLocationBtn.textContent =
                    "Allow";

            }
            catch (error) {

                console.error(
                    "❌ Backend request failed:",
                    error
                );


                allowLocationBtn.disabled =
                    false;

                denyLocationBtn.disabled =
                    false;

                allowLocationBtn.textContent =
                    "Allow";

            }

        }
    );

}


// ======================================================
// DENY
// ======================================================

if (denyLocationBtn) {

    denyLocationBtn.addEventListener(
        "click",
        function () {

            console.log(
                "🔴 LOCATION DENIED"
            );


            if (locationOverlay) {

                locationOverlay.style.display =
                    "none";

            }

        }
    );

}