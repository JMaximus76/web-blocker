const params = new URLSearchParams(window.location.search);

document.getElementById("blocked-url").innerHTML = params.get("url");