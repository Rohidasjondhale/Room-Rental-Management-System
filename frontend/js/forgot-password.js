async function forgotPassword(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;

  try {
    const response = await fetch(`${BASE_URL}/password/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      window.location.href = "login.html";
    }
  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  }
}