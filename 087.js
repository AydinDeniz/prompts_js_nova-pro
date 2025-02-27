// File upload feature for an admin dashboard

const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const fileList = document.getElementById('file-list');

const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
const maxSize = 5 * 1024 * 1024; // 5 MB

// Function to validate file types and size
function validateFile(file) {
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only PNG, JPEG, and PDF files are allowed.');
    }
    if (file.size > maxSize) {
        throw new Error('File size exceeds the maximum limit of 5 MB.');
    }
}

// Function to handle file upload
function handleFileUpload(event) {
    event.preventDefault();
    const files = fileInput.files;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            validateFile(file);
            uploadFile(file);
        } catch (error) {
            console.error('Error uploading file:', error.message);
            alert(error.message);
        }
    }
}

// Function to upload a file (simulated)
function uploadFile(file) {
    const li = document.createElement('li');
    li.textContent = file.name;
    fileList.appendChild(li);
    console.log('File uploaded:', file.name);
}

// Event listener for file input change
fileInput.addEventListener('change', () => {
    while (fileList.firstChild) {
        fileList.removeChild(fileList.firstChild);
    }
});

// Event listener for upload button click
uploadButton.addEventListener('click', handleFileUpload);