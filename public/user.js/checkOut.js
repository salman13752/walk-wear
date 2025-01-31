
    document.getElementById('orderForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(this);
        const response = await fetch('/placeOrder', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // ✅ Show success alert when order is placed
            Swal.fire({
                icon: 'success',
                title: 'Order Placed!',
                text: 'Your order has been placed successfully.',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/orderSuccess'; // Redirect after success
            });
        } else {
            // ❌ Show error alert if order fails
            Swal.fire({
                icon: 'error',
                title: 'Order Failed!',
                text: data.message || 'Something went wrong. Please try again!',
                confirmButtonText: 'OK'
            });
        }
    });

