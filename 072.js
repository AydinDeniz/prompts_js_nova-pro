// Client-side: JavaScript for building an image gallery with upload, preview, and drag-and-drop reordering features

const galleryContainer = document.getElementById('gallery-container');
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');

let images = [];

fileInput.addEventListener('change', handleFileSelect);
uploadButton.addEventListener('click', uploadImages);

function handleFileSelect(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('gallery-image');
                img.setAttribute('draggable', 'true');
                img.addEventListener('dragstart', dragStart);
                img.addEventListener('dragover', dragOver);
                img.addEventListener('drop', drop);
                galleryContainer.appendChild(img);
                images.push({ file, src: e.target.result });
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select only image files.');
        }
    }
    fileInput.value = ''; // Clear the file input
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.src);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const src = event.dataTransfer.getData('text');
    const draggedImage = document.querySelector(`img[src='${src}']`);
    const dropTarget = event.target;

    if (dropTarget !== draggedImage && dropTarget.classList.contains('gallery-image')) {
        const draggedIndex = Array.from(galleryContainer.children).indexOf(draggedImage);
        const dropIndex = Array.from(galleryContainer.children).indexOf(dropTarget);

        if (draggedIndex < dropIndex) {
            galleryContainer.insertBefore(draggedImage, dropTarget.nextSibling);
        } else {
            galleryContainer.insertBefore(draggedImage, dropTarget);
        }

        // Update the images array to reflect the new order
        const draggedImageData = images.splice(draggedIndex, 1)[0];
        images.splice(dropIndex, 0, draggedImageData);
    }
}

async function uploadImages() {
    if (images.length === 0) {
        alert('No images to upload.');
        return;
    }

    const formData = new FormData();
    images.forEach((image, index) => {
        formData.append(`images[${index}]`, image.file);
    });

    try {
        const response = await fetch('https://image-gallery-api.com/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Image upload failed.');
        }

        const result = await response.json();
        alert('Images uploaded successfully.');
        images = []; // Clear the images array
        galleryContainer.innerHTML = ''; // Clear the gallery container
    } catch (error) {
        alert('An error occurred while uploading images.');
        console.error(error);
    }
}