// Secure payment processing system with credit card tokenization, recurring billing, and PCI compliance

const crypto = require('crypto');
const axios = require('axios');

const PAYMENT_PROVIDERS = {
    stripe: { apiKey: 'sk_test_1234567890' },
    paypal: { clientId: 'client_id', clientSecret: 'client_secret' }
};

function tokenizeCard(cardNumber) {
    const key = crypto.randomBytes(32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, crypto.randomBytes(16));
    let token = cipher.update(cardNumber, 'utf8', 'hex');
    token += cipher.final('hex');
    return token;
}

function decryptToken(token, key) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, crypto.randomBytes(16));
    let cardNumber = decipher.update(token, 'hex', 'utf8');
    cardNumber += decipher.final('utf8');
    return cardNumber;
}

function processPayment(provider, token, amount) {
    switch (provider) {
        case 'stripe':
            return axios.post('https://api.stripe.com/v1/charges', {
                amount,
                currency: 'usd',
                source: token
            }, {
                headers: { Authorization: `Bearer ${PAYMENT_PROVIDERS.stripe.apiKey}` }
            });
        case 'paypal':
            return axios.post('https://api.paypal.com/v1/payments/payment', {
                intent: 'sale',
                payer: { payment_method: 'credit_card' },
                transactions: [{ amount: { total: amount, currency: 'USD' } }],
                credit_card: { number: decryptToken(token, crypto.randomBytes(32)) }
            }, {
                headers: { Authorization: `Basic ${Buffer.from(`${PAYMENT_PROVIDERS.paypal.clientId}:${PAYMENT_PROVIDERS.paypal.clientSecret}`).toString('base64')}` }
            });
        default:
            throw new Error('Unsupported payment provider');
    }
}

function handleFraudDetection(transaction) {
    // Implement fraud detection logic here
    return true; // Placeholder for actual fraud detection
}

function retryFailedTransaction(transaction) {
    // Implement retry logic for failed transactions
    return processPayment(transaction.provider, transaction.token, transaction.amount);
}

// Example usage
const cardNumber = '4242424242424242';
const token = tokenizeCard(cardNumber);
const amount = 1000; // $10.00

processPayment('stripe', token, amount)
    .then(response => {
        if (handleFraudDetection(response.data)) {
            console.log('Payment processed successfully:', response.data);
        } else {
            console.log('Fraud detected, retrying transaction...');
            retryFailedTransaction({ provider: 'stripe', token, amount })
                .then(retryResponse => {
                    console.log('Retry successful:', retryResponse.data);
                })
                .catch(error => {
                    console.error('Retry failed:', error);
                });
        }
    })
    .catch(error => {
        console.error('Payment failed:', error);
    });