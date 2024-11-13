function setHeaderImage() {
    const headerImage = document.getElementById('headerImage');
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 9) {
        headerImage.src = "assets/stupa.jpg"; // Replace with your morning image path
    }
    else if (currentHour >= 11 && currentHour < 19) {
        headerImage.src = "assets/kintsugi.jpeg";
    }
    else {
        headerImage.src = "assets/pexels-shotbyrain-4954713.jpg"; // Replace with your evening image path
    }

    :root {
        --darkblue: #F3F3FA;
        --lightgreen: #592316;
        --lightgreen: #592316;
        --darkgray: #592316;
        --lightgray: #F2F2F2;
    }
}

// Call the function when the page loads
window.onload = setHeaderImage;
