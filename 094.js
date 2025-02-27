// JavaScript sanitization library for XSS prevention, SQL injection protection, and input validation

const htmlEscape = (str) => {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
};

const sqlEscape = (str) => {
    return str.replace(/'/g, "''");
};

const validateInput = (input, rules) => {
    for (const rule of rules) {
        if (!rule.regex.test(input)) {
            throw new Error(`Input validation failed: ${rule.message}`);
        }
    }
};

const sanitize = (input, context, tenantRules) => {
    switch (context) {
        case 'html':
            return htmlEscape(input);
        case 'sql':
            return sqlEscape(input);
        default:
            throw new Error('Invalid context');
    }
};

const sanitizeWithTenantRules = (input, context, tenantId) => {
    const tenantRules = getTenantRules(tenantId); // Implement this function to fetch tenant-specific rules
    validateInput(input, tenantRules.validationRules);
    return sanitize(input, context, tenantRules);
};

// Example usage
const tenantRules = {
    validationRules: [
        { regex: /^[a-zA-Z0-9]+$/, message: 'Input must contain only alphanumeric characters' }
    ]
};

try {
    const sanitizedHtml = sanitizeWithTenantRules('<script>alert("XSS")</script>', 'html', 'tenant1');
    console.log('Sanitized HTML:', sanitizedHtml);

    const sanitizedSql = sanitizeWithTenantRules("Robert'); DROP TABLE Students; --", 'sql', 'tenant1');
    console.log('Sanitized SQL:', sanitizedSql);
} catch (error) {
    console.error('Sanitization error:', error.message);
}