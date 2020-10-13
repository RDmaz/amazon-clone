import React, { useState, useEffect } from "react";
import "./Payment.css";
import { useStateValue } from "./StateProvider";
import CheckoutProduct from "./CheckoutProduct";
import { Link, useHistory } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CurrencyFormat from "react-currency-format";
import { getBasketTotal } from "./reducer";
import axios from "./axios"; // pulling from the local file axios.
import { db } from "./firebase";

function Payment() {
  const [{ basket, user }, dispatch] = useStateValue();
  const history = useHistory();

  const stripe = useStripe();
  const elements = useElements();

  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState(true);

  useEffect(() => {
    // generate the special stripe secret which allows us to charge a customer, but if the basket changes - then we need a new stripe secret.
    const getClientSecret = async () => {
      const response = await axios({
        // we pas in een object
        // here we pause and we need axios. axios is a way to make requests (like post request etc')
        method: "post",
        // Stripe expects  the total in a currencies subunits
        url: `/payments/create?total=${getBasketTotal(basket) * 100}`, //after the create we pas in a query parameter: ?... stc' we pas in the total amount of the basket in order to charge the costumer. the ${} is a string interpulation.It is in cents, that's why *100
      });
      setClientSecret(response.data.clientSecret); // after we get the secret back we do this response.
    }; // what we did from line 21 till here is: whenever the basket changes it will make the request and update the special stripe secret to charge the client the correct amount.

    getClientSecret(); //this is how we call/run an async function in this useEffect.
  }, [basket]);

  console.log("THE SECRET IS >>>", clientSecret);
  console.log("👱", user);

  const handleSubmit = async (event) => {
    // do all the fancy stripe stuff...
    event.preventDefault(); // stops it from refreshing!
    setProcessing(true); // as soon as we hit the enter it will block us from hitting it again. remember the button in the form bellow is disabled or prossesing or succeded.

    // we need a client secret, we need to tell Stripe: "I have a client payment of...$, can you give me a client secret in order to run it by the card"
    const payload = await stripe
      .confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })
      .then(({ paymentIntent }) => {
        // paymentIntent = payment confirmation

        db.collection("users") //using no cycual data structure
          .doc(user?.uid)
          .collection("orders")
          .doc(paymentIntent.id)
          .set({
            basket: basket,
            amount: paymentIntent.amount,
            created: paymentIntent.created,
          });

        setSucceeded(true); //if it all went good
        setError(null);
        setProcessing(false);

        dispatch({
          type: "EMPTY_BASKET",
        });

        history.replace("/orders"); // we don't want to push otherwise will get them in a loop.they will be again in the payment page. not such a good user experiance. we're going to through them over to the order page.
      });
  };

  const handleChange = (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty); // if the event is empty disable the button
    setError(event.error ? event.error.message : ""); // if there is an error, show the error otherwise show nothing.
  };

  return (
    <div className="payment">
      <div className="payment__container">
        <h1>
          Checkout (<Link to="/checkout">{basket?.length} items</Link>)
          {/*embedded link. what it says: link is to the checkout page,in the ()it will say how many items we have. if we click on the tag it'll take us to the checkout page */}
        </h1>

        {/* payment section/delivery adres*/}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Delivery Address</h3>
          </div>
          <div className="patment__address">
            <p>{user?.email}</p>
            <p>123 React Lane</p>
            <p>Los Angeles, CA</p>
          </div>
        </div>
        {/* payment section/review items*/}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Review items and delivery</h3>
          </div>
          <div className="payment__items">
            {/*all we had in the basket will be shown in here and we'll have the remove functionality*/}
            {basket.map((item) => (
              <CheckoutProduct
                id={item.id}
                title={item.title}
                image={item.image}
                price={item.price}
                rating={item.rating}
              />
            ))}
          </div>
        </div>
        {/* payment section/payment method*/}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Payment Method</h3>
          </div>
          <div className="payment__details">
            {/*stripe magic*/}
            <form onSubmit={handleSubmit}>
              <CardElement onChange={handleChange} />
              <div className="payment__priceContainer">
                <CurrencyFormat
                  renderText={(value) => <h3>Order Total : {value}</h3>}
                  decimalScale={2}
                  value={getBasketTotal(basket)}
                  displayType={"text"}
                  thousandSeparator={true}
                  prefix={"$"}
                />
                <button disabled={processing || disabled || succeeded}>
                  <span>{processing ? <p>Processing</p> : "Buy Now"}</span>
                </button>
              </div>
              {/* Errors */}
              {error && <div>{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
