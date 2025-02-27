// Function to dynamically display user-generated text with rich formatting

function displayRichText(text, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container element not found');
        return;
    }

    // Validate input
    if (typeof text !== 'string') {
        console.error('Invalid input: text must be a string');
        return;
    }

    // Sanitize input to prevent XSS attacks
    const sanitizedText = sanitizeHTML(text);

    // Apply rich formatting based on options
    let formattedText = sanitizedText;
    if (options.bold) {
        formattedText = `<strong>${formattedText}</strong>`;
    }
    if (options.italic) {
        formattedText = `<em>${formattedText}</em>`;
    }
    if (options.underline) {
        formattedText = `<u>${formattedText}</u>`;
    }
    if (options.color) {
        formattedText = `<span style="color: ${options.color}">${formattedText}</span>`;
    }
    if (options.fontSize) {
        formattedText = `<span style="font-size: ${options.fontSize}">${formattedText}</span>`;
    }

    // Update the container with the formatted text
    container.innerHTML = formattedText;
}

// Function to sanitize HTML input
function sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Example usage
const text = 'This is a <script>alert("malicious code")</script> sample text.';
const containerId = 'rich-text-container';
const options = {
    bold: true,
    italic: true,
    color: 'blue',
    fontSize: '18px'
};

displayRichText(text, containerId, options);