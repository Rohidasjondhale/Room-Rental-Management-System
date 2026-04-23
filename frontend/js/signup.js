async function signup(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        role
      })
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      window.location.href = "login.html";
    }
  } catch (error) {
    console.log(error);
    alert("Signup failed");
  }
}