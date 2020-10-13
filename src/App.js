import React, { useEffect } from "react";
import "./App.css";
import Header from "./Header";
import Home from "./Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Checkout from "./Checkout";
import Login from "./Login";
import Payment from "./Payment";
import Orders from "./Orders";
import { auth } from "./firebase";
import { useStateValue } from "./StateProvider";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

/* shortcut:  go to the end of Home (line 12) press ctrl+space in order to get atomaticaly line 4. you don't have to type anything */

const promise = loadStripe(
  "pk_test_51HWUQkJyB9Qhz90Nhjec0jXI20Vk50eDPNQLwsgwgtKez9IaaqhJhQ20itIiWu9Tffu6wP3yeCVREcVxifm0LHvu00UKkX3gGt"
); // here we added our stripe publishable key API
function App() {
  const [{}, dispatch] = useStateValue();

  useEffect(() => {
    // create a listiner that keeps track of who is signed in .

    auth.onAuthStateChanged((authUser) => {
      // asap app loads we attach this listener. if we login or log out, it is there to observe.
      console.log("THE USER IS >>> ", authUser);

      if (authUser) {
        // the user just logged in / or the user was logged in

        dispatch({
          //this will be an object.
          type: "SET_USER", // this fireoff the event to the data layer. the info of the user. when log uit it will delete user from the data layer.
          user: authUser,
        });
      } else {
        // the user is logged out
        dispatch({
          type: "SET_USER",
          user: null, // like this nobody is loged in now.
        });
      }
    });
  }, []); // will only run once when the app component loads...that's why the array is empty.
  // it is like a dynamic if statement in React
  return (
    //BEM: className: App changed to app (small letter a)
    // video day 3 1:10:43 under cN app <Header /> bij mij en in de github niet?? 1:13:53 got an answer
    <Router>
      <div className="app">
        <Switch>
          <Route path="/orders">
            <Header />
            <Orders />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/checkout">
            <Header />
            <Checkout />
          </Route>
          <Route path="/payment">
            <Header />
            {/* we render the header - than we see in the adresbalk ..../payment*/}
            <Elements stripe={promise}>
              <Payment /> {/*with this we build the payment page*/}
            </Elements>
          </Route>
          <Route path="/">
            <Header />
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
