async function resetPassword(event) {
  event.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const newPassword = document.getElementById("newPassword").value;

  try {
    const response = await fetch(`${BASE_URL}/password/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token,
        newPassword
      })
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