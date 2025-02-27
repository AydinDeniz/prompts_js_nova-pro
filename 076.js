// JavaScript function for lazy-loading images with smooth transitions

const images = document.querySelectorAll('img[data-src]');
const placeholderClass = 'placeholder';
const loadedClass = 'loaded';

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function loadImage(image) {
    const src = image.getAttribute('data-src');
    if (!src) return;

    image.classList.add(placeholderClass);

    const img = new Image();
    img.src = src;
    img.onload = () => {
        image.src = src;
        image.classList.remove(placeholderClass);
        image.classList.add(loadedClass);
    };
}

function handleScroll() {
    images.forEach(image => {
        if (isInViewport(image) && !image.classList.contains(loadedClass)) {
            loadImage(image);
        }
    });
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);

// Initial check to load images that are already in the viewport on page load
handleScroll();