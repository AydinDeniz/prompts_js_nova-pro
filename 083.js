// Detailed function to redirect users to specific sections of a dashboard based on URL query parameters

function redirectToSection(url) {
    try {
        // Validate the URL format
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error('Invalid URL format. Please use http:// or https://');
        }

        const urlObj = new URL(url, window.location.origin);
        const params = new URLSearchParams(urlObj.search);
        const section = params.get('section');

        // Validate the presence of the section parameter
        if (!section) {
            throw new Error('Missing section parameter');
        }

        // Validate the section parameter against a list of valid sections
        const validSections = ['overview', 'analytics', 'settings'];
        if (!validSections.includes(section)) {
            throw new Error('Invalid section parameter. Valid sections are: ' + validSections.join(', '));
        }

        // Additional validation: check if the section parameter contains only alphanumeric characters
        if (!/^[a-zA-Z0-9]+$/.test(section)) {
            throw new Error('Section parameter contains invalid characters. Only alphanumeric characters are allowed.');
        }

        // Redirect to the specified section
        window.location.href = `/dashboard#${section}`;
    } catch (error) {
        console.error('Error redirecting to section:', error);
        alert('An error occurred while redirecting. Please check the URL and try again.');
    }
}

// Example usage with detailed validation
const url = 'https://example.com/dashboard?section=analytics';
redirectToSection(url);