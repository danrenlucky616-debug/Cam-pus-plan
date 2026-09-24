/* =========================================================
   PWA INSTALLATION
   ========================================================= */

let deferredInstallPrompt = null;

const installBtn = document.getElementById("installBtn");


/*
  Browser tells us when CampusPlan can be installed.
*/

window.addEventListener("beforeinstallprompt", event => {

  // Prevent the browser from showing its automatic prompt
  event.preventDefault();

  // Save the installation prompt
  deferredInstallPrompt = event;

  // Show our own Install CampusPlan button
  if (installBtn) {
    installBtn.style.display = "inline-block";
  }

});


/*
  User taps "Install CampusPlan"
*/

if (installBtn) {

  installBtn.addEventListener("click", async () => {

    if (!deferredInstallPrompt) {
      return;
    }


    // Show the browser installation dialog
    deferredInstallPrompt.prompt();


    // Wait for user's decision
    const result =
      await deferredInstallPrompt.userChoice;


    if (result.outcome === "accepted") {

      console.log(
        "CampusPlan installation accepted."
      );

    } else {

      console.log(
        "CampusPlan installation dismissed."
      );

    }


    // Prompt can only be used once
    deferredInstallPrompt = null;


    // Hide the button
    installBtn.style.display = "none";

  });

}


/*
  Detect when the app has already been installed.
*/

window.addEventListener("appinstalled", () => {

  console.log(
    "CampusPlan has been installed."
  );

  deferredInstallPrompt = null;

  if (installBtn) {
    installBtn.style.display = "none";
  }

});