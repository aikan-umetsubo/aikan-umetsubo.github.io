window.onload = () => {
    const request = new XMLHttpRequest();
    request.onload = (e) => {
        // parse the response to get fortune
        const response = JSON.parse(e.target.responseText);

        // display the fortune
        const fortune = document.querySelector("p#line2");
        fortune.innerHTML = response.message;

        // display the commandline
        document.querySelector('p#line3').classList.remove("hidden");
    }
    request.open("GET", "https://9lyxd9jwml.execute-api.us-east-1.amazonaws.com/dev");
    request.send();
}
