// Detailed function to evaluate user-defined formulas dynamically with user-provided input

function evaluateFormula(formula, variables) {
    try {
        // Replace variables in the formula with their values
        const parsedFormula = formula.replace(/(\w+)/g, (match) => {
            return variables[match] !== undefined ? variables[match] : match;
        });

        // Evaluate the parsed formula
        const result = eval(parsedFormula);
        return { success: true, result };
    } catch (error) {
        return { success: false, error: 'Invalid expression' };
    }
}

// Example usage with detailed user-provided input
const formulaInput = prompt('Enter your formula (e.g., 2 * (price - cost) / quantity):');
if (!formulaInput) {
    console.error('No formula provided.');
    return;
}

const variablesInput = prompt('Enter variables in JSON format (e.g., {"price": 100, "cost": 50, "quantity": 10}):');
if (!variablesInput) {
    console.error('No variables provided.');
    return;
}

try {
    // Parse the user-provided variables
    const variables = JSON.parse(variablesInput);

    // Evaluate the formula with the provided variables
    const evaluationResult = evaluateFormula(formulaInput, variables);

    if (evaluationResult.success) {
        console.log(`Result: ${evaluationResult.result}`);
    } else {
        console.error(`Error: ${evaluationResult.error}`);
    }
} catch (error) {
    console.error('Invalid JSON format for variables.');
}