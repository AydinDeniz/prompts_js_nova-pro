// Utility function to deeply merge two complex JSON objects

function deepMerge(obj1, obj2) {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return obj2 !== undefined ? obj2 : obj1;
    }

    const result = { ...obj1 };

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
                result[key] = obj1[key].concat(obj2[key].filter(item => !obj1[key].includes(item)));
            } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                result[key] = deepMerge(obj1[key], obj2[key]);
            } else {
                result[key] = obj2[key];
            }
        }
    }

    return result;
}

// Example usage
const obj1 = {
    a: 1,
    b: {
        x: 10,
        y: 20
    },
    c: [1, 2, 3]
};

const obj2 = {
    a: 2,
    b: {
        y: 25,
        z: 30
    },
    c: [3, 4, 5]
};

const mergedObj = deepMerge(obj1, obj2);
console.log(mergedObj);
// Output: { a: 2, b: { x: 10, y: 25, z: 30 }, c: [1, 2, 3, 4, 5] }