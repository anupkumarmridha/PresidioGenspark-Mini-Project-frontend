document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayProducts();
    // Add Product Modal
    document
        .getElementById("imageUrlOption")
        .addEventListener("change", toggleImageInput);
    document
        .getElementById("imageUploadOption")
        .addEventListener("change", toggleImageInput);

    // Edit Product Modal
    document
        .getElementById("editImageUrlOption")
        .addEventListener("change", toggleEditImageInput);
    document
        .getElementById("editImageUploadOption")
        .addEventListener("change", toggleEditImageInput);

        const addProductForm = document.getElementById('productForm');
        addProductForm.addEventListener('submit', handleAddProductFormSubmit);
        const editProductForm = document.getElementById('productEditForm');
        editProductForm.addEventListener('submit', handleEditProductFormSubmit);

});

function toggleImageInput() {
    if (document.getElementById("imageUrlOption").checked) {
        document.getElementById("productImageUrl").style.display = "block";
        document.getElementById("productImageFile").style.display = "none";
    } else {
        document.getElementById("productImageUrl").style.display = "none";
        document.getElementById("productImageFile").style.display = "block";
    }
}

function toggleEditImageInput() {
    if (document.getElementById("editImageUrlOption").checked) {
        document.getElementById("editProductImageUrl").style.display = "block";
        document.getElementById("editProductImageFile").style.display = "none";
    } else {
        document.getElementById("editProductImageUrl").style.display = "none";
        document.getElementById("editProductImageFile").style.display = "block";
    }
}

const baseUrl = 'http://localhost:5062/api';
const userToken = localStorage.getItem('userToken');
const productsPerPage = 5;
let currentPage = 1;
let products = [];

async function fetchAndDisplayProducts() {
    try {
        const response = await fetch(`${baseUrl}/Product/Seller`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        products = await response.json();
        renderTable();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function clearErrorMessages() {
    const errorFields = ['productNameError', 'productDescriptionError', 'productCategoryError', 'productPriceError', 'productQuantityError', 'productImageError'];
    errorFields.forEach(field => document.getElementById(field).textContent = '');
}

function getFormData(formId) {
    const formData = new FormData(document.getElementById(formId));
    const jsonObject = {};
    formData.forEach((value, key) => {
        if (key === 'quantity') {
            jsonObject[key] = parseInt(value, 10);
        } else if (key === 'price') {
            jsonObject[key] = parseFloat(value);
        } else {
            jsonObject[key] = value;
        }
    });
    return jsonObject;
}

function validateAddForm(data) {
    let isValid = true;
    const validations = [
        { field: 'productName', errorField: 'productNameError', message: 'Product name is required' },
        { field: 'productDescription', errorField: 'productDescriptionError', message: 'Description is required' },
        { field: 'productCategory', errorField: 'productCategoryError', message: 'Category is required' },
        { field: 'productPrice', errorField: 'productPriceError', message: 'Price is required', customValidation: value => parseFloat(value) > 0 },
        { field: 'productQuantity', errorField: 'productQuantityError', message: 'Quantity is required', customValidation: value => parseInt(value) > 0 },
    ];

    validations.forEach(({ field, errorField, message, customValidation }) => {
        const value = data[field];
        const inputElement = document.getElementById(field);
        const errorElement = document.getElementById(errorField);

        if (!value || (customValidation && !customValidation(value))) {
            errorElement.textContent = message;
            inputElement.classList.add('is-invalid');
            isValid = false;
        } else {
            errorElement.textContent = ''; // Clear error message if valid
            inputElement.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Mapping function
function mapAddProductFormData(formData) {
    return {
        name: formData.productName,
        description: formData.productDescription,
        quantity: parseInt(formData.productQuantity, 10),
        price: parseFloat(formData.productPrice),
        imageUrl: formData.imageOption === 'url' ? formData.productImageUrl : '', // Assume URL is preferred, and handle file upload separately
        categoryName: formData.productCategory
    };
}


async function handleAddProductFormSubmit(event) {
    event.preventDefault();
    clearErrorMessages();
    const formData = getFormData('productForm');
    // console.log(formData);

    if (!validateAddForm(formData)) {
        document.getElementById('productForm').classList.add('was-validated');
        return;
    }

    const mappedData = mapAddProductFormData(formData);

    try {
        const response = await addProductAPI(mappedData, 'POST');
        products.push(response);
        renderTable();
        resetForm('productForm');
        showToast('Product added successfully', 'success');

         // Close the modal
         const modalElement = document.getElementById('productModal');
         const modalInstance = bootstrap.Modal.getInstance(modalElement);
         modalInstance.hide();

    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function addProductAPI(formData) {
    try {
        const response = await fetch(`${baseUrl}/Product`, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errorMessage || 'Failed to add product');
        }

        return await response.json();
    } catch (error) {
        console.error('Error while adding product:', error);
        throw error;
    }
}


function validateEditForm(data) {
    let isValid = true;
    const validations = [
        { field: 'editproductName', errorField: 'editProductNameError', message: 'Product name is required' },
        { field: 'editproductDescription', errorField: 'editProductDescriptionError', message: 'Description is required' },
        { field: 'editproductCategory', errorField: 'editProductCategoryError', message: 'Category is required' },
        { field: 'editproductPrice', errorField: 'editProductPriceError', message: 'Price is required', customValidation: value => parseFloat(value) > 0 },
        { field: 'editproductQuantity', errorField: 'editProductQuantityError', message: 'Quantity is required', customValidation: value => parseInt(value) > 0 },
    ];

    validations.forEach(({ field, errorField, message, customValidation }) => {
        const value = data[field];
        const inputElement = document.getElementById(field);
        const errorElement = document.getElementById(errorField);

        if (!value || (customValidation && !customValidation(value))) {
            errorElement.textContent = message;
            inputElement.classList.add('is-invalid');
            isValid = false;
        } else {
            errorElement.textContent = ''; // Clear error message if valid
            inputElement.classList.remove('is-invalid');
        }
    });

    return isValid;
}
function mapEditProductFormData(formData) {
    return {
        name: formData.editproductName,
        description: formData.editproductDescription,
        quantity: parseInt(formData.editproductQuantity, 10),
        price: parseFloat(formData.editproductPrice),
        imageUrl: formData.editImageOption === 'url' ? formData.editProductImageUrl : '',
        categoryName: formData.editproductCategory
    };
}
async function handleEditProductFormSubmit(event) {
    event.preventDefault();
    clearErrorMessages();
    const formData = getFormData('productEditForm');
    const productId = formData.editproductId; 
    console.log(formData);
    if (!validateEditForm(formData)) {
        document.getElementById('productEditForm').classList.add('was-validated');
        return;
    }
    const mappedData = mapEditProductFormData(formData);
    try {
        const response = await editProductAPI(mappedData, productId);
        const editedProduct = products.find(p => p.id === formData.id);
        Object.assign(editedProduct, response);
        renderTable();
        resetForm('productEditForm');
        showToast('Product updated successfully', 'success');

         // Close the modal
         const modalElement = document.getElementById('productEditModal');
         const modalInstance = bootstrap.Modal.getInstance(modalElement);
         modalInstance.hide();

    } catch (error) {
        showToast(error.message, 'error');
    }
}



async function editProductAPI(formData, productId) {
    try {
        console.log('formData:', formData, 'productId:', productId);
        const response = await fetch(`${baseUrl}/Product/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(formData),
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errorMessage || 'Failed to edit product');
        }

        return await response.json();
    } catch (error) {
        console.error('Error while editing product:', error);
        throw error;
    }
}

// async function submitProductForm(formData, method) {
//     try {
//         const response = await fetch(`${baseUrl}/Product`, {
//             method,
//             body: JSON.stringify(formData),
//             headers: {
//                 'Authorization': `Bearer ${userToken}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.errorMessage || `Failed to ${method === 'POST' ? 'add' : 'edit'} product`);
//         }

//         return await response.json();
//     } catch (error) {
//         console.error(`Error while submitting product form:`, error);
//         throw error;
//     }
// }

async function deleteProduct(productId) {
    try {
        const response = await fetch(`${baseUrl}/Product/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to delete product');

        products = products.filter(product => product.productId !== productId);
        renderTable();
        showToast('Product deleted successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function fetchProduct(productId) {
    try {
        const response = await fetch(`${baseUrl}/Product/${productId}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch product');
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
    }
}

function populateModalFields(product, modalIdPrefix) {
    // console.log(product);
    document.getElementById(`${modalIdPrefix}productId`).value = product.productId;
    document.getElementById(`${modalIdPrefix}productName`).value = product.name;
    document.getElementById(`${modalIdPrefix}productDescription`).value = product.description;
    document.getElementById(`${modalIdPrefix}productCategory`).value = product.category.name;
    document.getElementById(`${modalIdPrefix}productPrice`).value = product.price;
    document.getElementById(`${modalIdPrefix}productQuantity`).value = product.quantity;
    document.getElementById(`${modalIdPrefix}ProductImageUrl`).value = product.imageUrl;
}

async function editProduct(productId) {
    try {
        const product = await fetchProduct(productId);
        if (product) {
            populateModalFields(product, 'edit');
            document.getElementById('productEditForm').dataset.productId = productId;
        }
    } catch (error) {
        console.error('Error fetching product:', error);
    }
}

function addProductToTable(product) {
    const { productId, name, description, category, quantity, price } = product;
    const imageUrl = product.imageUrl || '../assets/img/product-8-1.jpg';

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${productId}</td>
        <td>${name}</td>
        <td>${description}</td>
        <td>${category.name}</td>
        <td>${quantity}</td>
        <td>${price}</td>
        <td><img src="${imageUrl}" alt="${name}" width="50" height="50"></td>
        <td>
            <button class="btn btn-primary btn-sm me-2" data-bs-toggle="modal" data-bs-target="#productEditModal" onclick="editProduct(${productId})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${productId})">Delete</button>
        </td>
    `;
    document.querySelector('#productTable tbody').appendChild(newRow);
}

function renderTable() {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';
    const paginatedProducts = products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
    paginatedProducts.forEach(addProductToTable);
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(products.length / productsPerPage);
    const pagination = document.getElementById('pagination-product');
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" style="cursor:pointer;" onclick="goToPage(${i})">${i}</a>`;
        pagination.appendChild(pageItem);
    }
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

function resetForm(formId) {
    document.getElementById(formId).reset();
}

function showToast(message, status) {
    const toast = document.getElementById('toast');
    toast.className = `toast show ${status}`;
    const messageSpan = toast.querySelector('.message');
    if (messageSpan) {
        messageSpan.textContent = message;
    } else {
        const newMessageSpan = document.createElement('span');
        newMessageSpan.className = 'message';
        newMessageSpan.textContent = message;
        toast.appendChild(newMessageSpan);
    }
    setTimeout(() => {
        toast.className = 'toast hide';
    }, 3000);
}
