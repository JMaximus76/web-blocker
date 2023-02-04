


const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

document.getElementById("blocked-url").innerHTML = params.url;