const fetch = require('node-fetch');

function validateForm(name, email, phone) {
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!nameRegex.test(name)) {
        throw new Error('Invalid name');
    }
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email');
    }
    if (!phoneRegex.test(phone)) {
        throw new Error('Invalid phone number');
    }
}

async function submitForm(name, email, phone) {
    try {
        validateForm(name, email, phone);

        const response = await fetch('http://localhost:3000/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone })
        });

        if (!response.ok) {
            throw new Error('Submission failed');
        }

        const data = await response.json();
        return data.success ? 'Submission successful' : 'Submission failed';
    } catch (error) {
        return error.message;
    }
}

// Example usage:
submitForm('John Doe', 'johndoe@example.com', '1234567890')
    .then(message => console.log(message))
    .catch(error => console.error(error));