"use strict";

const reduceBtn = document.querySelector(".reduce-icon");
const sidebar = document.querySelector("aside"); // Représente toute la sidebar
const key = "sidebar-reduce";

/**
 * Vérifie si localstorage contient bien la clé qui mémorise l'état de la sidebar
 * au chargement de la page
 */
let initSidebar = () => {
    if (localStorage.getItem(key) && localStorage.getItem(key) === "true") {
        sidebar.classList.toggle("side-reduced");
    }
}

/**
 * Initialise l'état de la sidebar en mémoire
 */
let reducedSideBar = () => {
    sidebar.classList.toggle("side-reduced");
    const isReduce = `aside possède la classe "side-reduced"`;

    try {
        localStorage.setItem(key, "true");
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", initSidebar);
reduceBtn.addEventListener("click", reducedSideBar);