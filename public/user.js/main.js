// Add to Cart Function with Fetch and SweetAlert Toasts
async function addToCart(productId,comboId) {
  const quantityInput = document.querySelector(".quantity");
 
  
  const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1; // Default to 1 if input is not found or invalid
  // Construct the route dynamically using template literals
 
  const route = `/addCart/${productId}/combo/${comboId}`;
  try {
    // Send a fetch request to the server
    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }), // Include the user-selected quantity in the body
    });

    // Parse the response JSON
    const result = await response.json();

    if (response.ok) {
      // Success toast
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: result.message || "Added to cart successfully!",
        showConfirmButton: false,
        timer: 3000,
      });
    } else {
      // Error toast for server-side issues
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: result.message || "Failed to add to cart!",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  } catch (error) {
    // Error toast for client-side/network issues
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "please log in for Adding to Cart!",
      showConfirmButton: false,
      timer: 3000,
    });
    console.error("Error adding to cart:", error);
  }
}
