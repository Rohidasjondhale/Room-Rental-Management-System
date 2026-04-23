const bookingId = localStorage.getItem("bookingId");
const totalPrice = localStorage.getItem("totalPrice");
const token = localStorage.getItem("token");

if (!bookingId || !totalPrice) {
  alert("No booking found");
  window.location.href = "dashboard.html";
}

if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

document.getElementById("amountText").innerText = `Total Amount: ₹${totalPrice}`;

async function makePayment() {
  try {
    const orderResponse = await fetch(`${BASE_URL}/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ bookingId })
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      alert(orderData.message || "Failed to create payment order");
      return;
    }

    const cashfree = Cashfree({
      mode: "sandbox"
    });

    const checkoutOptions = {
      paymentSessionId: orderData.paymentSessionId,
      redirectTarget: "_self"
    };

    await cashfree.checkout(checkoutOptions);

    const verifyResponse = await fetch(`${BASE_URL}/payments/verify-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        orderId: orderData.orderId,
        bookingId
      })
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      alert(verifyData.message || "Payment verification failed");
      return;
    }

    alert("Payment successful");

    localStorage.removeItem("propertyId");
    localStorage.removeItem("bookingId");
    localStorage.removeItem("totalPrice");

    window.location.href = "dashboard.html";
  } catch (error) {
    console.log("Payment error:", error);
    alert("Payment failed");
  }
}