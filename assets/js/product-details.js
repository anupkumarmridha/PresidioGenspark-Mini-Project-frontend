document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    fetchProductDetails(productId);
});

const userToken = localStorage.getItem('userToken');
const userId = localStorage.getItem('userId'); 
const baseUrl = 'http://localhost:5062/api';

const fetchProductDetails = async (productId) => {
    try {
        const response = await fetch(`${baseUrl}/Product/${productId}`);
        const product = await response.json();
        displayProductDetails(product);
    } catch (error) {
        console.error('Error fetching product data:', error);
        showToast("Error fetching product data", "error");
    }
};

const displayProductDetails = (product) => {
    document.getElementById('product-image').src = product.imageUrl;
    document.getElementById('product-image').alt = product.name;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-category').textContent = product.category.name;
    document.getElementById('product-price').textContent = product.price;
    document.getElementById('product-rating').textContent = `Rating: ${(
        product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length
      ).toFixed(1)}`;
    document.getElementById('product-stock').textContent = product.quantity > 0 ? 'In Stock' : 'Out of Stock';

    const reviews = product.reviews || [];
    document.getElementById('product-reviews-count').textContent = reviews.length;
    document.getElementById('product-average-rating').textContent = reviews.length > 0 ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1) : 'N/A';

    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = reviews.map(review => createReviewHTML(review)).join('');

    document.getElementById('add-to-cart-btn').addEventListener('click', () => addToCart(product.productId));
    document.getElementById('buy-now-btn').addEventListener('click', () => buyNow(product.productId));
    document.getElementById('submit-review-btn').addEventListener('click', () => addReview(product.productId));
};

const createReviewHTML = (review) => {
    return `
        <div class="review" data-review-id="${review.reviewId}">
            <div class="review-details">
                <div class="review-rating">Rating: ${review.rating}</div>
                <p class="review-comment">${review.comment}</p>
                <div class="review-date">Reviewed on: ${new Date(review.createdDate).toLocaleDateString()}</div>
            </div>
            ${parseInt(review.customerId) === parseInt(userId) ? `
            <div class="review-actions">
                <button class="btn btn-warning btn-sm" onclick="openEditModal(${review.reviewId})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteReview(${review.reviewId})">Delete</button>
            </div>` : ''}
        </div>
    `;
};

const addToCart = async (productId) => {
    try {
        const quantity = document.getElementById('quantity').value;
        const bodyData = { 
            "productId": productId,
            "quantity": quantity
          };
          const userToken = localStorage.getItem('userToken');
          const response =  await fetch(`${baseUrl}/Cart`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Accept': 'text/plain',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
          });

          if(!response.ok) {
            console.log(response);
            if(response.status === 401) {
              throw new Error('Please login to add product to cart');
            }else if(response.status === 403) {
              throw new Error('You are not authorized to add product to cart');
            }
            else{
              throw new Error('Failed to add product to cart');
            }
          }
          const data = await response.json();

          console.log('Product added to cart:', data);
          showToast("Product added to cart", "success");
        // Your add to cart logic here
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast("Error adding to cart", "error");
    }
};

const buyNow = async (productId) => {
    try {
        const quantity = document.getElementById('quantity').value;
        console.log(`Buying product ${productId} with quantity ${quantity}`);
        // Your buy now logic here
    } catch (error) {
        console.error('Error buying product:', error);
        showToast("Error buying product", "error");
    }
};

const addReview = async (productId) => {
    try {
        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value;

        const response = await fetch(`${baseUrl}/Reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'text/plain',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ productId, rating, comment })
        });

        const data = await response.json();
        console.log('Review added:', data);
        showToast("Review added", "success");

        // Insert the new review into the DOM
        const reviewList = document.getElementById('review-list');
        reviewList.insertAdjacentHTML('beforeend', createReviewHTML(data));
        updateReviewSummary();

        // Clear the form fields
        document.getElementById('review-rating').value = '';
        document.getElementById('review-comment').value = '';

    } catch (error) {
        console.error('Error adding review:', error);
        showToast("Error adding review", "error");
    }
};


let currentReviewId;

const openEditModal = (reviewId) => {
    currentReviewId = reviewId;
    const review = document.querySelector(`.review[data-review-id="${reviewId}"]`);
    const rating = review.querySelector('.review-rating').textContent.split(': ')[1];
    const comment = review.querySelector('.review-comment').textContent;

    document.getElementById('edit-review-rating').value = rating;
    document.getElementById('edit-review-comment').value = comment;

    $('#editReviewModal').modal('show');
};

document.getElementById('save-review-btn').addEventListener('click', () => {
    editReview(currentReviewId);
});

const editReview = async (reviewId) => {
    try {
        const rating = document.getElementById('edit-review-rating').value;
        const comment = document.getElementById('edit-review-comment').value;

        const response = await fetch(`${baseUrl}/Reviews/${reviewId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'text/plain',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ rating, comment }) // Adjust as needed
        });

        const data = await response.json();
        console.log('Review updated:', data);
        showToast("Review updated", "success");
        
        // Update the review in the DOM
        const review = document.querySelector(`.review[data-review-id="${reviewId}"]`);
        review.querySelector('.review-rating').textContent = `Rating: ${rating}`;
        review.querySelector('.review-comment').textContent = comment;

        $('#editReviewModal').modal('hide');
    } catch (error) {
        console.error('Error updating review:', error);
        showToast("Error updating review", "error");
    }
};


const deleteReview = async (reviewId) => {
    try {
        const response = await fetch(`${baseUrl}/Reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (response.ok) {
            console.log('Review deleted');
            showToast("Review deleted", "success");
            // Remove the review from the DOM
            const reviewElement = document.querySelector(`.review[data-review-id="${reviewId}"]`);
            if (reviewElement) {
                reviewElement.remove();
            }
            updateReviewSummary();

        } else {
            console.error('Error deleting review:', response.statusText);
            showToast("Error deleting review", "error");
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        showToast("Error deleting review", "error");
    }
};

const updateReviewSummary = () => {
    const reviewList = document.getElementById('review-list');
    const reviews = Array.from(reviewList.getElementsByClassName('review'));
    const reviewCount = reviews.length;
    const averageRating = reviews.length > 0 ? 
        (reviews.reduce((acc, review) => acc + parseInt(review.querySelector('.review-rating').textContent.replace('Rating: ', '')), 0) / reviews.length).toFixed(1) 
        : 'N/A';

    document.getElementById('product-reviews-count').textContent = reviewCount;
    document.getElementById('product-average-rating').textContent = averageRating;
};

const showToast = (message, status) => {
    const toast = document.getElementById("toast");
    toast.className = "toast show";

    // Determine background color based on status
    let backgroundColor;
    switch (status) {
      case "success":
        backgroundColor = "rgb(4, 100, 4)";
        break;
      case "error":
        backgroundColor = "rgb(186, 93, 93)";
        break;
      default:
        backgroundColor = "rgb(4, 100, 4)"; // Default to success color
        break;
    }

    toast.style.backgroundColor = backgroundColor;
    toast.innerHTML = `<span class="close">&times;</span> ${message}`;

    setTimeout(function () {
      toast.className = toast.className.replace("show", "");
    }, 3000);

    const closeButton = document.querySelector(".toast .close");
    closeButton.onclick = function () {
      toast.style.visibility = "hidden";
    };
  };
