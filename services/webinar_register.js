import { FrappeApiClient } from "../services/FrappeApiClient.js";
let frappe_client = new FrappeApiClient();

// ✅ Setup toastr options immediately on load
toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: true,
  positionClass: "toast-top-right",
  preventDuplicates: true,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "4000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

// ✅ Register user for webinar
async function registerForWebinar(webinarId, userData) {
  try {
    const response = await frappe_client.post(`webinar_registration`, {
      webinarId,
      userData: JSON.stringify(userData), // send JSON string
    });

    console.log("Registration successful:", response);

    if (response?.message?.success === true) {
      toastr.success(response.message.message);
      setTimeout(() => {
        // window.location.href = "/pages/webinar";
      }, 1500);
    }else {
      toastr.error(response.message.error || "Registration failed. Please try again.");
    }
  } catch (error) {
    console.error("Error registering for webinar:", error);
    toastr.error("Registration failed. Please try again.");
  }
}

// ✅ Form submission handler
document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const first_name = document.getElementById("fname").value.trim();
  const last_name = document.getElementById("lname").value.trim();
  const organization = document.getElementById("organization").value.trim();
  const role = document.getElementById("role").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const interests = document.getElementById("interests").value.trim();

  const webinarId = new URLSearchParams(window.location.search).get("webinar_id");

  if (!webinarId) {
    toastr.error("Webinar ID is missing in URL.");
    return;
  }

  const userData = {
    first_name,
    last_name,
    organization,
    role,
    email,
    phone,
    interests,
  };

  console.log("Submitting webinar form:", userData);

  try {
    await registerForWebinar(webinarId, userData);
    document.querySelector("form").reset();
  } catch (err) {
    console.error("Form submission failed:", err);
    toastr.error("Something went wrong. Please try again.");
  }
});

const GetSetRoles = async () => {
  try {
    const response = await frappe_client.get("/get_doctype_list", {
        doctype: "Role Profile",
        fields: ["name", "role_profile"]
        
    });
    if (response?.message) {
      console.log("Roles Response:", response);
      const rolesSelect = document.getElementById("role");
    //   rolesSelect.innerHTML = ""; // Clear existing options

      response.message.forEach(role => {
        const option = document.createElement("option");
        option.value = role.name;
        option.textContent = role.name;
        rolesSelect.appendChild(option);
      });
    }
    console.log("Roles Response:", response);
    if (response?.message?.data) {
      const rolesSelect = document.getElementById("role");
      rolesSelect.innerHTML = ""; // Clear existing options

      response.message.data.forEach(role => {
        const option = document.createElement("option");
        option.value = role.name;
        option.textContent = role.role_name;
        rolesSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
}
window.onload =  () => {
GetSetRoles();
};
