const baseUrl = 'http://localhost:5062/api/Order';
const userToken = localStorage.getItem('userToken');

if (!userToken) {
  console.error('User token is missing. Please log in.');
}

async function fetchOrders() {
    try {
        const response = await fetch(`${baseUrl}/Customer`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch orders.');
        }

        const data = await response.json();
        console.log('Orders:', data);
        displayOrders(data);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

function displayOrders(orders) {
  const ordersElement = document.getElementById('orders');

  if (!ordersElement) {
      console.error('Orders element not found in the DOM.');
      return;
  }

  ordersElement.innerHTML = '';
  orders.forEach(order => {
      const orderItem = document.createElement('div');
      orderItem.className = 'order-item';
      orderItem.innerHTML = `
          <h3>Order #${order.orderId}</h3>
          <div class="order-details">
              <p>Total Price: $${order.totalPrice}</p>
              <p>Order Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
              <p>Address: ${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.zipCode}, ${order.address.country}</p>
              <p>Status: ${order.orderStatus}</p>
          </div>`;

      if (!order.isCanceled) {
          orderItem.innerHTML += `
              <button class="cancel-button" onclick="showConfirmCancelModal(${order.orderId})">Cancel Order</button>`;
      }

      ordersElement.appendChild(orderItem);
  });
}


function showConfirmCancelModal(orderId) {
    const modal = document.getElementById('confirmCancelModal');
    const closeBtn = modal.querySelector('.close');
    const confirmBtn = document.getElementById('confirmCancelButton');

    modal.style.display = 'block';

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    confirmBtn.onclick = () => {
        cancelOrder(orderId);
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

async function cancelOrder(orderId) {
    try {
        const response = await fetch(`${baseUrl}/${orderId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Accept': 'text/plain'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to cancel order.');
        }

        fetchOrders();
    } catch (error) {
        console.error('Error canceling order:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});
