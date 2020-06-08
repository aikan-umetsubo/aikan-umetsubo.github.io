window.onload = () => {
    const request = new XMLHttpRequest();
    request.onload = (e) => {
        const response = JSON.parse(e.target.responseText);
        const fortune = document.querySelector("article#fortune");
        fortune.innerHTML = response.message;
    }
    request.open("GET", "https://9lyxd9jwml.execute-api.us-east-1.amazonaws.com/dev");
    request.send();
}
