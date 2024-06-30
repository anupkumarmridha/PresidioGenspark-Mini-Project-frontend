const baseUrl = 'http://localhost:5062/api/Address';
const userToken = localStorage.getItem('userToken');

// Fetch all addresses
async function fetchAddresses() {
  const response = await fetch(baseUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Accept': 'text/plain'
    }
  });
  const data = await response.json();
  console.log('Addresses:', data);
  displayAddresses(data);
}

// Add a new address
async function addAddress(address) {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Accept': 'text/plain',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(address)
  });
  fetchAddresses();
}

// Update an address
async function updateAddress(addressId, address) {
  const response = await fetch(`${baseUrl}/${addressId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Accept': 'text/plain',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(address)
  });
  fetchAddresses();
}

// Delete an address
async function deleteAddress(addressId) {
  await fetch(`${baseUrl}/${addressId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Accept': 'text/plain'
    }
  });
  fetchAddresses();
}

// Display addresses in the DOM
function displayAddresses(addresses) {
  const addressElement = document.getElementById('addressContainer');
  addressElement.innerHTML = '';
  
  addresses.forEach(address => {
    const addressDiv = document.createElement('div');
    addressDiv.className = 'address-item';
    addressDiv.innerHTML = `
      <p><strong>${address.addressId}. </strong> ${address.street}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}</p>
      <button class="btn btn-primary" onclick="showUpdateModal(${address.addressId})">Edit</button>
      <button class="btn btn-danger" onclick="deleteAddress(${address.addressId})">Delete</button>
    `;
    addressElement.appendChild(addressDiv);
  });
}

// Show update modal with address data
function showUpdateModal(addressId) {
  // Fetch address details and populate the form
  fetch(`${baseUrl}/${addressId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Accept': 'text/plain'
    }
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('addressType').value = data.addressType;
    document.getElementById('phoneNumber').value = data.phoneNumber;
    document.getElementById('street').value = data.street;
    document.getElementById('city').value = data.city;
    document.getElementById('state').value = data.state;
    document.getElementById('zipCode').value = data.zipCode;
    document.getElementById('country').value = data.country;

    // Save the addressId in a hidden field or global variable
    document.getElementById('addressForm').dataset.addressId = addressId;

    // Show the modal
    $('#addressModal').modal('show');
  });
}

// Handle form submission
document.getElementById('addressForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const address = {
    addressType: document.getElementById('addressType').value,
    phoneNumber: document.getElementById('phoneNumber').value,
    street: document.getElementById('street').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zipCode: document.getElementById('zipCode').value,
    country: document.getElementById('country').value
  };

  const addressId = document.getElementById('addressForm').dataset.addressId;
  if (addressId) {
    // Update address
    updateAddress(addressId, address);
  } else {
    // Add new address
    addAddress(address);
  }

  // Hide the modal
  $('#addressModal').modal('hide');

  // Clear the form
  document.getElementById('addressForm').reset();
  delete document.getElementById('addressForm').dataset.addressId;
});

// Clear form for adding new address
function clearForm() {
  document.getElementById('addressForm').reset();
  delete document.getElementById('addressForm').dataset.addressId;
}

function showAddModal() {
    // Clear the form
    clearForm();
  
    // Show the modal
    $('#addressModal').modal('show');
  }
// Initial fetch of addresses
fetchAddresses();
