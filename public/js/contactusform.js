async function handleSubContactUs(event) {
    event.preventDefault();

    let status = document.querySelector(".btn-contact-us");
    let data = new FormData(event.target);

    status.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting <i class="fas fa-spinner fa-spin"></i>`;

    fetch(event.target.action, {
        method: formcontactus.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    }).then((response) => {

        if (response.status === 200) {

            status.innerHTML = `Thanks for the message!`;

            setTimeout(function () {  // Delay 3 detik baru back Send Message button
                status.innerHTML = `Send Message`;
            }, 3000);

        } else {

            response.json()
                .then((data) => {
                    console.log(data);
                });

            status.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error <i class="fas fa-exclamation-triangle"></i>`;

            setTimeout(function () {  // Delay 3 detik baru back Send Message button
                status.innerHTML = `Send Message`;
            }, 3000);

        }

        formcontactus.reset();

    }).catch((error) => {

        status.innerHTML = `Please try again later`;

    });
}

let formcontactus = document.getElementById("form-contact-us");
formcontactus.addEventListener("submit", handleSubContactUs);

