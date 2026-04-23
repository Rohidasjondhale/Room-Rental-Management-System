const token = localStorage.getItem("token");
const params = new URLSearchParams(window.location.search);

const orderId = params.get("order_id");
const bookingId = params.get("booking_id");

async function verifyPayment() {
  const statusText = document.getElementById("statusText");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  if (!orderId || !bookingId) {
    statusText.innerText = "Missing order or booking details";
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/payments/verify-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        orderId,
        bookingId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      statusText.innerText = data.message || "Payment verification failed";
      return;
    }

    statusText.innerText = "Payment successful. Redirecting to dashboard...";

    localStorage.removeItem("propertyId");
    localStorage.removeItem("bookingId");
    localStorage.removeItem("totalPrice");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  } catch (error) {
    console.log(error);
    statusText.innerText = "Something went wrong while verifying payment";
  }
}

verifyPayment();