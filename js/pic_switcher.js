function setHeaderImage() {
    const headerImage = document.getElementById('headerImage');
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 11) {
        headerImage.src = "assets/kintsugi.jpeg"; // Replace with your morning image path
    }
    else if (currentHour >= 11 && currentHour < 19) {
        headerImage.src = "assets/kintsugi.jpeg";
    }
    else {
        headerImage.src = "assets/kintsugi.jpeg"; // Replace with your evening image path
    }
}

// Call the function when the page loads
window.onload = setHeaderImage;
