let headernavbar = document.getElementById('header');
let searchBtn = document.querySelector('button#search-btn');
let searchForm = document.querySelector('#header form.search-form');

let menu = document.querySelector('div.icons button#menu-btn-mobile');
let navbar = document.querySelector('header#header nav');

let signlog = document.querySelector('div.icons button#signlog-btn');
let boxSignlogProfile = document.querySelector('.maxlgcontainernav div.pen-userpro-signlog');
// let boxUserContent = document.querySelector('div.boxusercontent ');
// let boxUserSignlog = document.querySelector('div.boxusersignlog');




searchBtn.addEventListener('click', function () {
    // Jika button search di click, maka..
    searchBtn.classList.toggle('fa-times');
    searchForm.classList.toggle('active');
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
    signlog.classList.remove('fa-times');
    signlog.classList.add('fa-user');
    boxSignlogProfile.classList.remove('active');
    // boxUserSignlog.classList.remove('active');
    // boxUserContent.classList.remove('active');
});

menu.addEventListener('click', function () {
    // Jika button menu di click, maka..
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
    searchBtn.classList.remove('fa-times');
    searchForm.classList.remove('active');
    signlog.classList.remove('fa-times');
    signlog.classList.add('fa-user');
    boxSignlogProfile.classList.remove('active');
    // boxUserSignlog.classList.remove('active');
    // boxUserContent.classList.remove('active');
});

signlog.addEventListener('click', function (e) {
    // Jika button signlog di click, maka..
    if (!e.target.classList.contains('fa-times')) {
        // Jika button signlog tidak memiliki class fa-times, maka..
        signlog.classList.remove('fa-user');
        signlog.classList.add('fa-times');
    } else {
        // Jika button signlog memiliki class fa-times, maka..
        signlog.classList.remove('fa-times');
        signlog.classList.add('fa-user');
    }
    boxSignlogProfile.classList.toggle('active');
    // boxUserSignlog.classList.toggle('active');
    // boxUserContent.classList.toggle('active');
    searchBtn.classList.remove('fa-times');
    searchForm.classList.remove('active');
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
});

window.onscroll = function () {
    // Jika windows di scroll oleh user, maka..
    if (window.scrollY > 0) {
        // Jika windows di scroll lebih dari 0, maka..
        headernavbar.classList.add('active');
    } else {
        // Jika windows di scroll kurang dari 0, maka..
        headernavbar.classList.remove('active');
    }

    searchBtn.classList.remove('fa-times');
    searchForm.classList.remove('active');
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
    signlog.classList.remove('fa-times');
    signlog.classList.add('fa-user');
    boxSignlogProfile.classList.remove('active');
    // boxUserSignlog.classList.remove('active');
    // boxUserContent.classList.remove('active');

}




// START Script untuk penanda link active pada Navbar
let linknavbar = document.querySelectorAll('header#header nav ul#navbar li a');

linknavbar.forEach((link) => {  // forEach untuk mengulangi setiap elemen dari array linknavbar
    if (link.href === window.location.href) { // klu nilai href link yg di ulang sama dgn link di url address, maka tmbahkan class active pada link
        link.classList.add('active');
    }
})
// END Script untuk penanda link active pada Navbar




// START Script Reveal Element Effect on scroll
window.addEventListener('scroll', reveal); // klu windows di scroll, maka.. jlankan function reveal
window.addEventListener('DOMContentLoaded', reveal); // klu windows di load, maka.. jlankan function reveal

function reveal() { // function reveal

    let reveals = document.querySelectorAll('.reveal');

    for (let i = 0; i < reveals.length; i++) {
        let windowHeight = window.innerHeight; // The variable, windowHeight is the height of the viewport
        let revealtop = reveals[i].getBoundingClientRect().top; // The variable, revealtop is the top position of the element
        let revealpoint = 150; // The variable, revealpoint is the point at which the element should be revealed

        if (revealtop < windowHeight - revealpoint) { // If the element is not revealed, then..
            reveals[i].classList.add('active'); // Add the class active to the element
        }
        else {
            reveals[i].classList.remove('active'); // Remove the class active from the element
        }
    }

}
// END Script Reveal Element Effect on scroll




// START Script untuk Update Tahun Footer
let tahunfooter = document.querySelector('.footer-bottom span:nth-child(3)');
let tahunterbaru = new Date().getFullYear();
tahunfooter.innerText = ` ${tahunterbaru} All rights reserved.`;
// END Script untuk Update Tahun Footer

