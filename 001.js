function jsonToCsv(json) {
    function getHeaders(obj, prefix = '') {
        let headers = [];
        for (let key in obj) {
            if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                headers = headers.concat(getHeaders(obj[key], prefix + key + '_'));
            } else {
                headers.push(prefix + key);
            }
        }
        return headers;
    }

    function getValue(obj, key) {
        return key.split('_').reduce((o, k) => (o && o[k] !== 'undefined') ? o[k] : '', obj);
    }

    const headers = getHeaders(json);
    let csv = headers.join(',') + '\n';

    json.forEach(item => {
        let row = headers.map(header => {
            let value = getValue(item, header);
            return value === undefined ? '' : value;
        }).join(',');
        csv += row + '\n';
    });

    return csv;
}

// Example usage:
const nestedJson = [
    {
        "name": "John",
        "address": {
            "city": "New York",
            "zip": "10001"
        }
    },
    {
        "name": "Jane",
        "address": {
            "city": "Los Angeles"
        }
    }
];

console.log(jsonToCsv(nestedJson));