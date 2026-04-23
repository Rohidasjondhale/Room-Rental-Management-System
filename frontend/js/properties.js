async function loadProperties() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/properties`, {
      headers: {
        Authorization: token
      }
    });

    const data = await response.json();

    const propertyList = document.getElementById("propertyList");
    propertyList.innerHTML = "";

    data.properties.forEach((property) => {
      const div = document.createElement("div");
      div.className = "property-card";

      div.innerHTML = `
        <h3>${property.title}</h3>
        <p><b>Description:</b> ${property.description}</p>
        <p><b>Location:</b> ${property.location}</p>
        <p><b>Price:</b> ₹${property.price} / ${property.priceType}</p>
        <p><b>Available:</b> ${property.available ? "Yes" : "No"}</p>
        <button onclick="bookProperty(${property.id})">Book Now</button>
      `;

      propertyList.appendChild(div);
    });
  } catch (error) {
    console.log(error);
    alert("Failed to load properties");
  }
}

function bookProperty(id) {
  localStorage.setItem("propertyId", id);
  window.location.href = "booking.html";
}

loadProperties();
