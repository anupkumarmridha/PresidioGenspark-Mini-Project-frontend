document.addEventListener('DOMContentLoaded', function() {
    var baseUrl = 'http://localhost:5062/api/User';

    document.getElementById('signupForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        // Clear previous errors
        clearErrors();

        // Validate form
        let isValid = true;
        if (!validateField('username')) isValid = false;
        if (!validateField('email', validateEmail)) isValid = false;
        if (!validateField('phone')) isValid = false;
        if (!validateField('password')) isValid = false;
        if (!validatePasswordMatch()) isValid = false;

        if (isValid) {
            const formData = new FormData(this);
            try {
                const response = await fetch(`${baseUrl}/CustomerRegister`, {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(formData)),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });

    function validateField(id, customValidation) {
        const field = document.getElementById(id);
        const errorSpan = document.getElementById(id + 'Error');
        if (!field.value || (customValidation && !customValidation(field.value))) {
            field.classList.add('is-invalid');
            errorSpan.textContent = 'This field is required or invalid';
            return false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            errorSpan.textContent = '';
            return true;
        }
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorSpan = document.getElementById('confirmPasswordError');
        if (password !== confirmPassword) {
            document.getElementById('confirmPassword').classList.add('is-invalid');
            errorSpan.textContent = 'Passwords do not match';
            return false;
        } else {
            document.getElementById('confirmPassword').classList.remove('is-invalid');
            document.getElementById('confirmPassword').classList.add('is-valid');
            errorSpan.textContent = '';
            return true;
        }
    }

    function clearErrors() {
        const errorSpans = document.querySelectorAll('span.text-danger');
        errorSpans.forEach(span => span.textContent = '');
        const invalidFields = document.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => field.classList.remove('is-invalid'));
        const validFields = document.querySelectorAll('.is-valid');
        validFields.forEach(field => field.classList.remove('is-valid'));
    }
});
