const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
  alert("Please login first");
  window.location.href = "login.html";
}

const welcomeText = document.getElementById("welcomeText");
const ownerLayout = document.getElementById("ownerLayout");
const tenantLayout = document.getElementById("tenantLayout");
const ownerSection = document.getElementById("ownerSection");
const ownerPropertiesSection = document.getElementById("ownerPropertiesSection");
const ownerBookingsSection = document.getElementById("ownerBookingsSection");
const tenantSection = document.getElementById("tenantSection");
const myBookingsSection = document.getElementById("myBookingsSection");

let editingPropertyId = null;

welcomeText.innerText = `Welcome, ${user.name} (${user.role})`;

if (user.role === "owner") {
  ownerLayout.style.display = "block";
  ownerSection.style.display = "block";
  ownerPropertiesSection.style.display = "block";
  ownerBookingsSection.style.display = "block";
  loadOwnerProperties();
  loadOwnerBookings();
} else if (user.role === "tenant") {
  tenantLayout.style.display = "block";
  tenantSection.style.display = "block";
  myBookingsSection.style.display = "block";
  loadMyBookings();
}

async function addProperty(event) {
  event.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;
  const price = document.getElementById("price").value;
  const priceType = document.getElementById("priceType").value;

  try {
    let response;

    if (editingPropertyId) {
      response = await fetch(`${BASE_URL}/properties/${editingPropertyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          title,
          description,
          location,
          price,
          priceType
        })
      });
    } else {
      response = await fetch(`${BASE_URL}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          title,
          description,
          location,
          price,
          priceType
        })
      });
    }

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to save property");
      return;
    }

    alert(editingPropertyId ? "Property updated successfully" : "Property added successfully");

    resetPropertyForm();
    loadOwnerProperties();
  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  }
}

function editProperty(id, title, description, location, price, priceType) {
  document.getElementById("title").value = title;
  document.getElementById("description").value = description;
  document.getElementById("location").value = location;
  document.getElementById("price").value = price;
  document.getElementById("priceType").value = priceType;

  editingPropertyId = id;
  document.getElementById("propertySubmitBtn").innerText = "Update Property";
}

function resetPropertyForm() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("location").value = "";
  document.getElementById("price").value = "";
  document.getElementById("priceType").value = "";
  editingPropertyId = null;
  document.getElementById("propertySubmitBtn").innerText = "Add Property";
}

async function loadOwnerProperties() {
  try {
    const response = await fetch(`${BASE_URL}/properties`);
    const data = await response.json();

    const ownerPropertyList = document.getElementById("ownerPropertyList");
    ownerPropertyList.innerHTML = "";

    if (!response.ok) {
      ownerPropertyList.innerHTML = `<p>${data.message || "Failed to load properties"}</p>`;
      return;
    }

    const myProperties = (data.properties || []).filter(
      (property) => property.UserId === user.id
    );

    if (myProperties.length === 0) {
      ownerPropertyList.innerHTML = "<p>No properties added yet</p>";
      return;
    }

    myProperties.forEach((property) => {
      const div = document.createElement("div");
      div.className = "property-card";

      div.innerHTML = `
        <h4>${property.title}</h4>
        <p><b>Description:</b> ${property.description}</p>
        <p><b>Location:</b> ${property.location}</p>
        <p><b>Price:</b> ₹${property.price} / ${property.priceType}</p>
        <p><b>Available:</b> ${property.available ? "Yes" : "No"}</p>
        <button onclick='editProperty(${property.id}, ${JSON.stringify(property.title)}, ${JSON.stringify(property.description)}, ${JSON.stringify(property.location)}, ${JSON.stringify(property.price)}, ${JSON.stringify(property.priceType)})'>Edit</button>
        <button onclick="deleteProperty(${property.id})">Delete</button>
      `;

      ownerPropertyList.appendChild(div);
    });
  } catch (error) {
    console.log(error);
    document.getElementById("ownerPropertyList").innerHTML = "<p>Failed to load properties</p>";
  }
}

async function deleteProperty(id) {
  const confirmDelete = confirm("Are you sure you want to delete this property?");

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/properties/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to delete property");
      return;
    }

    alert("Property deleted successfully");

    if (editingPropertyId === id) {
      resetPropertyForm();
    }

    loadOwnerProperties();
  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  }
}

async function loadMyBookings() {
  try {
    const response = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      method: "GET",
      headers: {
        "Authorization": token
      }
    });

    const data = await response.json();

    const bookingList = document.getElementById("bookingList");
    bookingList.innerHTML = "";

    if (!response.ok) {
      bookingList.innerHTML = `<p>${data.message || "Failed to load bookings"}</p>`;
      return;
    }

    if (!data.bookings || data.bookings.length === 0) {
      bookingList.innerHTML = "<p>No bookings found</p>";
      return;
    }

    const bookings = [...data.bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    bookings.forEach((booking) => {
      const div = document.createElement("div");
      div.className = "property-card";

      div.innerHTML = `
        <h4>${booking.Property ? booking.Property.title : "Property"}</h4>
        <p><b>Tenant Name:</b> ${user.name}</p>
        <p><b>Tenant Email:</b> ${user.email}</p>
        <p><b>Owner Name:</b> ${booking.Owner ? booking.Owner.name : "N/A"}</p>
        <p><b>Owner Phone:</b> ${booking.Owner ? booking.Owner.phone : "N/A"}</p>
        <p><b>Location:</b> ${booking.Property ? booking.Property.location : "N/A"}</p>
        <p><b>Price:</b> ₹${booking.Property ? booking.Property.price : "N/A"} / ${booking.Property ? booking.Property.priceType : "N/A"}</p>
        <p><b>Booking Date:</b> ${new Date(booking.createdAt).toLocaleDateString()}</p>
        <p><b>Check-In:</b> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
        <p><b>Check-Out:</b> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
        <p><b>Total Price:</b> ₹${booking.totalPrice} (${booking.Property ? booking.Property.priceType : "N/A"})</p>
        <p><b>Status:</b> ${booking.status}</p>
        ${booking.status === "cancelled" && booking.cancelReason ? `<p><b>Cancellation Reason:</b> ${booking.cancelReason}</p>` : ""}
        ${
          booking.status !== "cancelled" && booking.status !== "completed"
            ? `<button onclick="cancelMyBooking('${booking.id}')">Cancel Booking</button>`
            : ""
        }
      `;

      bookingList.appendChild(div);
    });
  } catch (error) {
    console.log(error);
    document.getElementById("bookingList").innerHTML = "<p>Failed to load bookings</p>";
  }
}

async function loadOwnerBookings() {
  try {
    const response = await fetch(`${BASE_URL}/bookings/owner-bookings`, {
      method: "GET",
      headers: {
        "Authorization": token
      }
    });

    const data = await response.json();

    const ownerBookingList = document.getElementById("ownerBookingList");
    ownerBookingList.innerHTML = "";

    if (!response.ok) {
      ownerBookingList.innerHTML = `<p>${data.message || "Failed to load owner bookings"}</p>`;
      return;
    }

    if (!data.bookings || data.bookings.length === 0) {
      ownerBookingList.innerHTML = "<p>No bookings found</p>";
      return;
    }

    data.bookings.forEach((booking) => {
      const div = document.createElement("div");
      div.className = "property-card";

      div.innerHTML = `
        <h4>${booking.Property ? booking.Property.title : "Property"}</h4>
        <p><b>Tenant Name:</b> ${booking.Tenant ? booking.Tenant.name : "N/A"}</p>
        <p><b>Tenant Email:</b> ${booking.Tenant ? booking.Tenant.email : "N/A"}</p>
        <p><b>Tenant Phone:</b> ${booking.Tenant ? booking.Tenant.phone : "N/A"}</p>
        <p><b>Location:</b> ${booking.Property ? booking.Property.location : "N/A"}</p>
        <p><b>Price:</b> ₹${booking.Property ? booking.Property.price : "N/A"} / ${booking.Property ? booking.Property.priceType : "N/A"}</p>
        <p><b>Check-In:</b> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
        <p><b>Check-Out:</b> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
        <p><b>Total Price:</b> ₹${booking.totalPrice} (${booking.Property ? booking.Property.priceType : "N/A"})</p>
        <p><b>Status:</b> ${booking.status}</p>
        ${booking.status === "cancelled" && booking.cancelReason ? `<p><b>Cancellation Reason:</b> ${booking.cancelReason}</p>` : ""}
        ${
          booking.status !== "cancelled" && booking.status !== "completed"
            ? `
              <button onclick="updateBooking('${booking.id}', 'confirmed')">Confirm</button>
              <button onclick="updateBooking('${booking.id}', 'cancelled')">Cancel</button>
              <button onclick="updateBooking('${booking.id}', 'completed')">Complete</button>
            `
            : ""
        }
      `;

      ownerBookingList.appendChild(div);
    });
  } catch (error) {
    console.log(error);
    document.getElementById("ownerBookingList").innerHTML = "<p>Failed to load owner bookings</p>";
  }
}

async function updateBooking(id, status) {
  try {
    let cancelReason = "";

    if (status === "cancelled") {
      cancelReason = prompt("Enter cancellation reason:");

      if (!cancelReason || cancelReason.trim() === "") {
        alert("Cancellation reason is required");
        return;
      }
    }

    const response = await fetch(`${BASE_URL}/bookings/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ status, cancelReason })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update booking");
      return;
    }

    alert(data.message);
    loadOwnerBookings();
  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  }
}

async function cancelMyBooking(id) {
  try {
    const confirmCancel = confirm("Are you sure you want to cancel this booking?");

    if (!confirmCancel) {
      return;
    }

    const response = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
      method: "PUT",
      headers: {
        "Authorization": token
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to cancel booking");
      return;
    }

    alert(data.message);
    loadMyBookings();
  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("propertyId");
  localStorage.removeItem("bookingId");
  localStorage.removeItem("totalPrice");
  window.location.href = "login.html";
}