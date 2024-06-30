const baseUrl = 'http://localhost:5062/api/Cart';
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

function displayCart(items) {
  const cartElement = document.getElementById('cart');
  
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
}

document.addEventListener('DOMContentLoaded', () => {
  fetchCart();
});
