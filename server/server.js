const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });

  // Start the database connection
  db.once('open', () => {
    // Set up static file serving and wildcard route
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/dist')));
    }

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
    });
  });
}

startApolloServer();

