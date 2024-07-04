const baseUrl = 'http://localhost:5062/api/Cart';
const orderUrl = 'http://localhost:5062/api/Order';
const addressUrl = 'http://localhost:5062/api/Address';
const userToken = localStorage.getItem('userToken');

if (!userToken) {
  console.error('User token is missing. Please log in.');
}

async function fetchCart() {
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Accept': 'text/plain'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart items.');
    }

    const data = await response.json();
    console.log('Cart:', data.items);
    displayCart(data.items);
  } catch (error) {
    console.error('Error fetching cart:', error);
  }
}

async function updateQuantity(productId, quantity) {
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Accept': 'text/plain',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity })
    });

    if (!response.ok) {
        console.log(response);
      throw new Error('Failed to update quantity.');
    }

    fetchCart();
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
}

async function removeItem(productId) {
  try {
    const response = await fetch(`${baseUrl}/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Accept': 'text/plain'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove item.');
    }

    fetchCart();
  } catch (error) {
    console.error('Error removing item:', error);
  }
}

async function fetchAddresses() {
  try {
    const response = await fetch(addressUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Accept': 'text/plain'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch addresses.');
    }

    const addresses = await response.json();
    populateAddressSelection(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
  }
}

function populateAddressSelection(addresses) {
  const addressSelection = document.getElementById('address-selection');
  
  addresses.forEach(address => {
    const option = document.createElement('option');
    option.value = address.addressId;
    option.textContent = `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}`;
    addressSelection.appendChild(option);
  });
}

async function checkout() {
  const addressId = document.getElementById('address-selection').value;
  if (!addressId) {
    alert('Please select an address for checkout.');
    return;
  }

  try {
    const response = await fetch(`${orderUrl}/Checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ addressId })
    });

    if (!response.ok) {
      throw new Error('Checkout failed.');
    }

    const data = await response.json();
    console.log('Checkout successful:', data);
    alert('Checkout successful!');
    displayCart([]);
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('Checkout failed.');
  }
}

function displayCart(items) {
  const cartElement = document.getElementById('cart');
  if (!items || items.length === 0) {
    cartElement.innerHTML = '<h2>Your cart is empty.</h2>';
    document.getElementById('checkout-button').disabled = true;
    document.getElementById('address-selection').disabled = true;
    return;
  }
  
  if (!cartElement) {
    console.error('Cart element not found in the DOM.');
    return;
  }
  
  cartElement.innerHTML = '';
  items.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${item.product.imageUrl || '../assets/img/product-8-1.jpg'}" alt="${item.product.name}" />
      <div class="cart-item-info">
        <h4>${item.product.name}</h4>
        <p>${item.product.description}</p>
        <p>Price: $${item.price}</p>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateQuantity(${item.productId}, ${-1})">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity(${item.productId}, ${1})">+</button>
        <button onclick="removeItem(${item.productId})">Remove</button>
      </div>
    `;
    cartElement.appendChild(cartItem);

  });

  // const addressSelection = document.createElement('select');
  // addressSelection.id = 'address-selection';
  // addressSelection.className = 'form-control';
  // addressSelection.innerHTML = '<option value="">Select an address</option>';
  // cartElement.appendChild(addressSelection);

  // const checkoutButton = document.createElement('button');
  // checkoutButton.id = 'checkout-button';
  // checkoutButton.className = 'btn btn-primary';
  // checkoutButton.textContent = 'Checkout';
  // cartElement.appendChild(checkoutButton);



}

document.addEventListener('DOMContentLoaded', () => {
  fetchCart();
  fetchAddresses();
  document.getElementById('checkout-button').addEventListener('click', checkout);
});
