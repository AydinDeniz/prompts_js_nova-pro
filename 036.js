// User Service (users.js)
const express = require('express');
const { GraphQLClient } = require('graphql-request');

const app = express();
const endpoint = 'http://localhost:4000/graphql';
const graphQLClient = new GraphQLClient(endpoint);

app.get('/users', async (req, res) => {
    const query = `
        query {
            users {
                id
                name
                email
            }
        }
    `;
    const data = await graphQLClient.request(query);
    res.json(data.users);
});

app.listen(3001, () => {
    console.log('User Service running on port 3001');
});

// Product Service (products.js)
const express = require('express');
const { GraphQLClient } = require('graphql-request');

const app = express();
const endpoint = 'http://localhost:4000/graphql';
const graphQLClient = new GraphQLClient(endpoint);

app.get('/products', async (req, res) => {
    const query = `
        query {
            products {
                id
                name
                price
            }
        }
    `;
    const data = await graphQLClient.request(query);
    res.json(data.products);
});

app.listen(3002, () => {
    console.log('Product Service running on port 3002');
});

// Order Service (orders.js)
const express = require('express');
const { GraphQLClient } = require('graphql-request');

const app = express();
const endpoint = 'http://localhost:4000/graphql';
const graphQLClient = new GraphQLClient(endpoint);

app.get('/orders', async (req, res) => {
    const query = `
        query {
            orders {
                id
                userId
                productId
                quantity
            }
        }
    `;
    const data = await graphQLClient.request(query);
    res.json(data.orders);
});

app.listen(3003, () => {
    console.log('Order Service running on port 3003');
});

// GraphQL Server (graphql.js)
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLID } = require('graphql');
const { users, products, orders } = require('./data');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString }
    })
});

const ProductType = new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        price: { type: GraphQLString }
    })
});

const OrderType = new GraphQLObjectType({
    name: 'Order',
    fields: () => ({
        id: { type: GraphQLID },
        userId: { type: GraphQLID },
        productId: { type: GraphQLID },
        quantity: { type: GraphQLString }
    })
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve() {
                return users;
            }
        },
        products: {
            type: new GraphQLList(ProductType),
            resolve() {
                return products;
            }
        },
        orders: {
            type: new GraphQLList(OrderType),
            resolve() {
                return orders;
            }
        }
    }
});

const schema = new GraphQLSchema({
    query: Query
});

const express = require('express');
const { graphqlHTTP } = require('express-graphql');

const app = express();

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(4000, () => {
    console.log('GraphQL Server running on port 4000');
});

// Data (data.js)
const users = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' }
];

const products = [
    { id: '1', name: 'Product 1', price: '10.00' },
    { id: '2', name: 'Product 2', price: '20.00' }
];

const orders = [
    { id: '1', userId: '1', productId: '1', quantity: '1' },
    { id: '2', userId: '2', productId: '2', quantity: '2' }
];

module.exports = { users, products, orders };