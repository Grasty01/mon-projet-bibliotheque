document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('aside');
    const toggleBtn = document.querySelector('.reduce-menu-icon');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('toggled');
        });
    }
});