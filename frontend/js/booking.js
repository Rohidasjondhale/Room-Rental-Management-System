async function createBooking(event) {
  event.preventDefault();

  const token = localStorage.getItem("token");
  const propertyId = localStorage.getItem("propertyId");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  if (!propertyId) {
    alert("Property not selected");
    window.location.href = "properties.html";
    return;
  }

  const checkInDate = document.getElementById("checkInDate").value;
  const checkOutDate = document.getElementById("checkOutDate").value;

  if (!checkInDate || !checkOutDate) {
    alert("Please select both dates");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        propertyId,
        checkInDate,
        checkOutDate
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Booking failed");
      return;
    }

    alert(data.message);

    localStorage.setItem("bookingId", data.booking.id);
    localStorage.setItem("totalPrice", data.booking.totalPrice);

    window.location.href = "payment.html";
  } catch (error) {
    console.log(error);
    alert("Booking failed");
  }
}