


// const params = new Proxy(new URLSearchParams(window.location.search), {
//     get: (searchParams, prop) => searchParams.get(prop),
// });



const params = new URLSearchParams(window.location.search);

document.getElementById("blocked-url").innerHTML = params.get("url");