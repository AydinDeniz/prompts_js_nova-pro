// Function to parse raw JSON from a request body and convert it into a JavaScript object

function parseJson(rawJson) {
    try {
        // Validate input format
        if (typeof rawJson !== 'string') {
            throw new Error('Input must be a string');
        }

        // Parse the JSON string into a JavaScript object
        const jsonObject = JSON.parse(rawJson);

        // Validate the parsed object
        if (typeof jsonObject !== 'object' || jsonObject === null) {
            throw new Error('Invalid JSON format');
        }

        return jsonObject;
    } catch (error) {
        // Handle parsing errors gracefully
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid JSON format');
    }
}

// Example usage
const rawJson = '{"name": "John", "age": 30, "address": {"city": "New York", "zip": "10001"}}';

try {
    const parsedObject = parseJson(rawJson);
    console.log('Parsed JSON object:', parsedObject);
} catch (error) {
    console.error('Error:', error.message);
}