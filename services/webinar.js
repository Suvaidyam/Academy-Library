import { FrappeApiClient } from "../services/FrappeApiClient.js";
let frappe_client = new FrappeApiClient();

document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const first_name = document.getElementById("fname").value.trim();
  const last_name = document.getElementById("lname").value.trim();
  const organization = document.getElementById("organization").value.trim();
  const role = document.getElementById("role").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const interests = document.getElementById("interests").value.trim();

  try {
    const result = await frappe_client.post("register_webinar", {
      first_name,
      last_name,
      organization,
      role,
      email,
      phone,
      interests,
    });

    console.log("Full API Response:", result);

    if (result.message?.status === "success") {
      alert(result.message.message);
      document.querySelector("form").reset(); 
    } else {
      alert(result.message?.message || "Something went wrong.");
    }
  } catch (error) {
    console.error("Form submission failed:", error);
    alert("Something went wrong. Please try again.");
  }
});
