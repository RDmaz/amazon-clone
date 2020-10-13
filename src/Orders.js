import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import "./Orders.css";
import { useStateValue } from "./StateProvider";
import Order from "./Order";

function Orders() {
  const [{ basket, user }, dispatch] = useStateValue();
  const [orders, setOrders] = useState([]); // state that stores all the orders

  useEffect(() => {
    //when de app loads we say useEffect hoek and it'll run only once.if we keep the brackets empty it'll only run once.
    if (user) {
      // hier we protect ourselfs
      db.collection("users") //access to the user collection in the firebase.
        .doc(user?.uid) //get the specific user that is there
        .collection("orders") // access the orders of the user.
        .orderBy("created", "desc") // all the created order arrange decending , most recent at the top.
        .onSnapshot((
          snapshot //this is real time
        ) =>
          setOrders(
            snapshot.docs.map((doc) => ({
              //return all the orders as document
              id: doc.id,
              data: doc.data(),
            }))
          )
        );
    } else {
      setOrders([]);
    }
  }, [user]);

  return (
    <div className="orders">
      <h1>Your Orders</h1>

      <div className="orders__order">
        {orders?.map((order) => (
          <Order order={order} />
        ))}
      </div>
    </div>
  );
}

export default Orders;
