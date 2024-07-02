$(document).ready(function () {
  const productList = $('#product-list');
  const pagination = $('#pagination');
  const searchBar = $('#search-bar');
  const categoryFilter = $('#category-filter');
  const ratingFilter = $('#rating-filter');

  let products = [];
  const productsPerPage = 6;
  let currentPage = 1;
  const baseUrl = 'http://localhost:5062/api';
  const fetchTemplate = async (url) => {
      try {
          const response = await fetch(url);
          return await response.text();
      } catch (error) {
          console.error('Error fetching template:', error);
          return '';
      }
  };

  const fetchProducts = async (url) => {
      try {
          const response = await $.ajax({
              url: url,
              method: 'GET',
          });
          products = response;
          console.log('Products:', products);
          displayProducts(products);
          setupPagination(products);
      } catch (error) {
          console.error('Error fetching products:', error);
      }
  };

  const fetchCategories = async () => {
      try {
          const response = await $.ajax({
              url: `${baseUrl}/Product/categories`,
              method: 'GET',
          });
          populateCategories(response);
      } catch (error) {
          console.error('Error fetching categories:', error);
      }
  };

  const populateCategories = (categories) => {
      categories.forEach(category => {
          const option = $(`<option value="${category.categoryId}">${category.name}</option>`);
          categoryFilter.append(option);
      });
  };

  // const displayProducts = async (productArray) => {
  //     const template = await fetchTemplate('Product/ProductCard.html');
  //     productList.empty();
  //     const start = (currentPage - 1) * productsPerPage;
  //     const end = start + productsPerPage;
  //     const paginatedProducts = productArray.slice(start, end);

  //     paginatedProducts.forEach(product => {
  //         const productCard = template
  //             .replace(/{thumbnail}/g, product.thumbnail || 'default.jpg')
  //             .replace(/{title}/g, product.title)
  //             .replace(/{description}/g, product.description)
  //             .replace(/{brand}/g, product.brand)
  //             .replace(/{sku}/g, product.sku)
  //             .replace(/{weight}/g, product.weight)
  //             .replace(/{dimensions}/g, `${product.dimensions.width}x${product.dimensions.height}x${product.dimensions.depth} cm`)
  //             .replace(/{warrantyInformation}/g, product.warrantyInformation)
  //             .replace(/{shippingInformation}/g, product.shippingInformation)
  //             .replace(/{price}/g, product.price.toFixed(2))
  //             .replace(/{discountPercentage}/g, product.discountPercentage)
  //             .replace(/{ratingClass}/g, getRatingClass(product.rating))
  //             .replace(/{rating}/g, product.rating)
  //             .replace(/{stockClass}/g, product.availabilityStatus === 'Low Stock' ? 'low-stock' : '')
  //             .replace(/{availabilityStatus}/g, product.availabilityStatus)
  //             .replace(/{reviewsCount}/g, product.reviews.length)
  //             .replace(/{averageRating}/g, calculateAverageRating(product.reviews))
  //             .replace(/{id}/g, product.id);

  //         productList.append(productCard);
  //     });

  //     $('.add-to-cart-btn').on('click', function () {
  //       const productId = $(this).data('product-id');
  //       let quantity=document.getElementById(`quantity-${productId}`).value;
  //       console.log(quantity);
  //         addToCart(productId, quantity);
  //     });
  // };

  const displayProducts = async (productArray) => {
    const template = await fetchTemplate('Product/ProductCard.html');
    productList.empty();
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = productArray.slice(start, end);

    paginatedProducts.forEach(product => {
        const productCard = template
            .replace(/{thumbnail}/g, product.imageUrl || '/assets/img/product-2-1.jpg')
            .replace(/{title}/g, product.name)
            .replace(/{description}/g, product.description)
            .replace(/{category}/g, product.category.name)  // Assuming brand is stored in category name
            .replace(/{price}/g, product.price.toFixed(2))
            .replace(/{ratingClass}/g, getRatingClass(product.rating || 0))
            .replace(/{rating}/g, product.rating || '0')
            .replace(/{stockClass}/g, product.quantity < 10 ? 'low-stock' : '')  // Assuming low stock is less than 10
            .replace(/{availabilityStatus}/g, product.quantity < 10 ? 'Low Stock' : 'In Stock')
            .replace(/{reviewsCount}/g, product.reviews ? product.reviews.length : 0)
            .replace(/{averageRating}/g, product.reviews ? calculateAverageRating(product.reviews) : '0')
            .replace(/{id}/g, product.productId);

        productList.append(productCard);
    });

    $('.add-to-cart-btn').on('click', function () {
        const productId = $(this).data('product-id');
        let quantity = document.getElementById(`quantity-${productId}`).value;
        quantity = parseInt(quantity);
        console.log(productId, quantity);
        addToCart(productId, quantity);
    });
};


  const setupPagination = (productArray) => {
      pagination.empty();
      const totalPages = Math.ceil(productArray.length / productsPerPage);

      for (let i = 1; i <= totalPages; i++) {
          const button = $(`<button>${i}</button>`);
          if (i === currentPage) {
              button.addClass('active');
          }

          button.on('click', async () => {
              currentPage = i;
              await displayProducts(products);
              setupPagination(products);
          });

          pagination.append(button);
      }
  };

  const calculateOriginalPrice = (price, discountPercentage) => {
      return (price / (1 - discountPercentage / 100)).toFixed(2);
  };

  const getRatingClass = (rating) => {
      if (rating >= 4.5) return 'high';
      if (rating >= 3.5) return 'medium';
      return 'low';
  };

  const calculateAverageRating = (reviews) => {
      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      return (totalRating / reviews.length).toFixed(2);
  };

  const filterProducts = async () => {
    const searchQuery = searchBar.val().toLowerCase();
    const selectedCategory = categoryFilter.val();
    const selectedRating = ratingFilter.val();
    const minPrice = $('#min-price').val() || 0;
    let maxPrice = $('#max-price').val();

    // Ensure maxPrice is a valid number and set a reasonable default if not
    if (!maxPrice || isNaN(maxPrice)) {
        maxPrice = 1000000; // Set a reasonable default maximum price
    }

    let url = `${baseUrl}/Product/filter?minPrice=${minPrice}&maxPrice=${maxPrice}`;

    if (selectedCategory !== 'all') {
        url += `&categoryId=${selectedCategory}`;
    }

    if (selectedRating === 'high') {
        url += `&minRating=4.5`;
    } else if (selectedRating === 'medium') {
        url += `&minRating=3.5&maxRating=4.49`;
    } else if (selectedRating === 'low') {
        url += `&maxRating=3.49`;
    }
    // console.log(url);

    await fetchProducts(url);
    applyFiltersAndSort(searchQuery);
};

// Function to apply additional filters and sort the products
const applyFiltersAndSort = async (searchQuery) => {
    let filteredProducts = products.filter(product => {
        return product.name.toLowerCase().includes(searchQuery) || product.description.toLowerCase().includes(searchQuery);
    });

    filteredProducts.sort((a, b) => b.rating - a.rating);
    await displayProducts(filteredProducts);
};

function debounce(func, delay) {
  let debounceTimer;
  return function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
  };
}

  // const filterProducts = async () => {
  //     const searchQuery = searchBar.val().toLowerCase();
  //     const selectedCategory = categoryFilter.val();
  //     const selectedRating = ratingFilter.val();

  //     let url = `${baseUrl}/Product`;
  //     if (selectedCategory !== 'all') {
  //         url = `https://dummyjson.com/products/category/${selectedCategory}`;
  //     }
      
  //     await fetchProducts(url);
  //     applyFiltersAndSort(searchQuery, selectedRating);
  // };

  // const applyFiltersAndSort = async (searchQuery, selectedRating) => {
  //     let filteredProducts = products.filter(product => {
  //         const matchesSearch = product.title.toLowerCase().includes(searchQuery) || product.description.toLowerCase().includes(searchQuery);
  //         let matchesRating = true;
  //         if (selectedRating === 'high') {
  //             matchesRating = product.rating >= 4.5;
  //         } else if (selectedRating === 'medium') {
  //             matchesRating = product.rating >= 3.5 && product.rating < 4.5;
  //         } else if (selectedRating === 'low') {
  //             matchesRating = product.rating < 3.5;
  //         }

  //         return matchesSearch && matchesRating;
  //     });

  //     // Sort products by rating in descending order
  //     filteredProducts.sort((a, b) => b.rating - a.rating);

  //     await displayProducts(filteredProducts);
  // };

  const showToast = (message) => {
      const toast = document.getElementById("toast");
      toast.className = "toast show";
      toast.innerHTML = `<span class="close">&times;</span> ${message}`;

      setTimeout(function () {
          toast.className = toast.className.replace("show", "");
      }, 3000);

      const closeButton = document.querySelector('.toast .close');
      closeButton.onclick = function () {
          toast.style.visibility = 'hidden';
      };
  };

  const addToCart = async (productId, quantity) => {
      try {
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
            throw new Error('Failed to add product to cart');
          }
          const data = await response.json();

          console.log('Product added to cart:', data);
          showToast("Product added to cart");
      } catch (error) {
          console.error('Error adding to cart:', error);
          alert('Failed to add product to cart');
      }
  };

  searchBar.on('input', filterProducts);
  categoryFilter.on('change', filterProducts);
  ratingFilter.on('change', filterProducts);

  // fetchProducts('https://dummyjson.com/products');
  fetchProducts(`${baseUrl}/Product`);
  fetchCategories();

  // Auth Related
  // Function to check if user is authenticated
function isAuthenticated() {
  return !!localStorage.getItem('userToken');
}

function isSeller() {
    const role = localStorage.getItem('userRole');
    return role === 'Seller';
}
function isCustomer() {
    const role = localStorage.getItem('userRole');
    return role === 'Customer';
}

function updateUI() {
  const authSection = document.getElementById('authSection');
  const logoutBtnContainer = document.getElementById('logoutBtnContainer');
  const tabMenu = document.getElementById('tab-menu');

  if (isAuthenticated()) {
    // User is authenticated, show logout button
    authSection.innerHTML = `
      <ul class="login-btns">
        <li class="login-btns-items" id="logoutBtnContainer">
          <button type="button" class="btn btn-danger" id="logoutBtn">
            Logout
          </button>
        </li>
      </ul>
    `;
    logoutBtnContainer.style.display = 'inline-block';

    if (isSeller()) {
        tabMenu.appendChild(
            document.createElement('li')).
            innerHTML = `<a href="/Product/Product.html">Dashboard</a>`;
    }
    if(isCustomer()) {
       tabMenu.appendChild(document.createElement('li')).innerHTML = `<a href="/cart.html">Cart</a>`;
       tabMenu.appendChild(document.createElement('li')).innerHTML = `<a href="#">Orders</a>`;
       tabMenu.appendChild(document.createElement('li')).innerHTML = `<a href="/address.html">Address</a>`;
    }
  } else {
    // User is not authenticated, show login/signup buttons
    authSection.innerHTML = `
      <ul class="login-btns">
        <li class="login-btns-items">
          <button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#loginModal">
            Login
          </button>
        </li>
        <li class="login-btns-items">
          <button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#signupModal">
            Sign up
          </button>
        </li>
      </ul>
    `;
    logoutBtnContainer.style.display = 'none';
  }
}

// Function to handle logout
function logout() {
  localStorage.removeItem('userToken'); // Clear user token (or any other auth data)
  updateUI(); // Update UI after logout
}

// Event listener for logout button click
document.addEventListener('click', function(event) {
  if (event.target && event.target.id === 'logoutBtn') {
    logout();
  }
});

// Initial UI update
updateUI();

});
