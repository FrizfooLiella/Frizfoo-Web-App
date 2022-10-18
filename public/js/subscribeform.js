async function handleSubFormSubs(event) {
    event.preventDefault();

    let status = document.querySelector(".subnews-btn");
    let data = new FormData(event.target);

    status.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting <i class="fas fa-spinner fa-spin"></i>`;

    fetch(event.target.action, {
        method: formsubscribe.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    }).then((response) => {

        if (response.status === 200) {

            status.innerHTML = `Thanks for subscribing!`;

            setTimeout(function () {  // Delay 3 detik baru back Subs button
                status.innerHTML = `Subscribe`;
            }, 3000);

        } else {

            response.json()
                .then((data) => {
                    console.log(data);
                });

            status.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error <i class="fas fa-exclamation-triangle"></i>`;

            setTimeout(function () {  // Delay 3 detik baru back Subs button
                status.innerHTML = `Subscribe`;
            }, 3000);

        }

        formsubscribe.reset();

    }).catch((error) => {

        status.innerHTML = `Please try again later`;

    });
}

let formsubscribe = document.getElementById("my-subscribeform");
formsubscribe.addEventListener("submit", handleSubFormSubs);

