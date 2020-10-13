const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51HWUQkJyB9Qhz90NSlRHtr4dXObyiMMPX81JKteUyow58tJGHalxDzNzVTd3L8EbWVZPL09gnBmsIaDhoB6SMtMx002dnJCBIH"
);

// API

// - App config
const app = express();

// - Middlewares
app.use(cors({ origin: true })); // cors is sort of security
app.use(express.json()); // allows us to send data and pas it in json format

// - API routes
app.get("/", (request, response) => response.status(200).send("hello world"));

app.post("/payments/create", async (request, response) => {
  const total = request.query.total;

  console.log("Payment Request Recieved BOOM!!! for this amount >>> ", total);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total, // it is an objectsubunits of the currency
    currency: "usd",
  });

  // OK - Created
  response.status(201).send({
    clientSecret: paymentIntent.client_secret,
  });
});

// - Listen command
exports.api = functions.https.onRequest(app);

// Example endpoint
// http://localhost:5001/clone-7a098/us-central1/api

// Sonny deleted this - read it, check it out.
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
