$(document).ready(function () {
  const productList = $('#product-list');
  const pagination = $('#pagination');
  const searchBar = $('#search-bar');
  const categoryFilter = $('#category-filter');
  const ratingFilter = $('#rating-filter');

  let products = [];
  const productsPerPage = 6;
  let currentPage = 1;

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
          products = response.products;
          displayProducts(products);
          setupPagination(products);
      } catch (error) {
          console.error('Error fetching products:', error);
      }
  };

  const fetchCategories = async () => {
      try {
          const response = await $.ajax({
              url: 'https://dummyjson.com/products/categories',
              method: 'GET',
          });
          populateCategories(response);
      } catch (error) {
          console.error('Error fetching categories:', error);
      }
  };

  const populateCategories = (categories) => {
      categories.forEach(category => {
          const option = $(`<option value="${category}">${category}</option>`);
          categoryFilter.append(option);
      });
  };

  const displayProducts = async (productArray) => {
      const template = await fetchTemplate('Product/ProductCard.html');
      productList.empty();
      const start = (currentPage - 1) * productsPerPage;
      const end = start + productsPerPage;
      const paginatedProducts = productArray.slice(start, end);

      paginatedProducts.forEach(product => {
          const productCard = template
              .replace(/{thumbnail}/g, product.thumbnail || 'default.jpg')
              .replace(/{title}/g, product.title)
              .replace(/{description}/g, product.description)
              .replace(/{brand}/g, product.brand)
              .replace(/{sku}/g, product.sku)
              .replace(/{weight}/g, product.weight)
              .replace(/{dimensions}/g, `${product.dimensions.width}x${product.dimensions.height}x${product.dimensions.depth} cm`)
              .replace(/{warrantyInformation}/g, product.warrantyInformation)
              .replace(/{shippingInformation}/g, product.shippingInformation)
              .replace(/{price}/g, product.price.toFixed(2))
              .replace(/{discountPercentage}/g, product.discountPercentage)
              .replace(/{ratingClass}/g, getRatingClass(product.rating))
              .replace(/{rating}/g, product.rating)
              .replace(/{stockClass}/g, product.availabilityStatus === 'Low Stock' ? 'low-stock' : '')
              .replace(/{availabilityStatus}/g, product.availabilityStatus)
              .replace(/{reviewsCount}/g, product.reviews.length)
              .replace(/{averageRating}/g, calculateAverageRating(product.reviews))
              .replace(/{id}/g, product.id);

          productList.append(productCard);
      });

      $('.add-to-cart-btn').on('click', function () {
        const productId = $(this).data('product-id');
        let quantity=document.getElementById(`quantity-${productId}`).value;
        console.log(quantity);
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

      let url = 'https://dummyjson.com/products';
      if (selectedCategory !== 'all') {
          url = `https://dummyjson.com/products/category/${selectedCategory}`;
      }
      
      await fetchProducts(url);
      applyFiltersAndSort(searchQuery, selectedRating);
  };

  const applyFiltersAndSort = async (searchQuery, selectedRating) => {
      let filteredProducts = products.filter(product => {
          const matchesSearch = product.title.toLowerCase().includes(searchQuery) || product.description.toLowerCase().includes(searchQuery);
          let matchesRating = true;
          if (selectedRating === 'high') {
              matchesRating = product.rating >= 4.5;
          } else if (selectedRating === 'medium') {
              matchesRating = product.rating >= 3.5 && product.rating < 4.5;
          } else if (selectedRating === 'low') {
              matchesRating = product.rating < 3.5;
          }

          return matchesSearch && matchesRating;
      });

      // Sort products by rating in descending order
      filteredProducts.sort((a, b) => b.rating - a.rating);

      await displayProducts(filteredProducts);
  };

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
          const response = await fetch('https://dummyjson.com/carts/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  userId: 1,
                  products: [
                      {
                          id: productId,
                          quantity: quantity,
                      }
                  ]
              })
          });

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

  fetchProducts('https://dummyjson.com/products');
  fetchCategories();
});
