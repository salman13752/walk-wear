document.addEventListener('DOMContentLoaded', () => {
  function selectCombo(button) {
    // Retrieve data from the button's dataset
    const productId = button.dataset.productId;
    const comboId = button.getAttribute('data-combos-id');
    const size = button.dataset.size;

    // Perform your fetch request using the dataset values
    fetch(`/productDetails/combo/${productId}?size=${size}&comboId=${comboId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Update the price information
          document.getElementById("currentPrice").innerHTML = `<span> ₹${data.combo.salePrice.toLocaleString()} </span>`;
          document.getElementById("regularPrice").innerHTML = `<del>₹${data.combo.regularPrice.toLocaleString()}</del>`;

          // Update the quantity status and action buttons
          const quantityStatus = document.getElementById("quantityStatus");
          const actionButtons = document.getElementById("actionButtons");

          if (data.combo.quantity > 0) {
            quantityStatus.innerHTML = `${data.combo.quantity} Items in Stock`;
            actionButtons.innerHTML = `
              <button class="btn btn-success" id="addToCart" onclick="addToCart('${productId}', '${comboId}')">Add to Cart</button>
            `;
          } else {
            quantityStatus.innerHTML = `<span class="text-danger">Out of Stock</span>`;
            actionButtons.innerHTML = `<button class="btn btn-danger" disabled>Out of Stock</button>`;
          }

          // Toggle the selected state for the combo buttons
          document.querySelectorAll(".combo-option").forEach((button) => {
            const isSelected = button.dataset.size === size;

            // Apply the appropriate classes based on selection
            if (isSelected) {
              button.classList.add("btn-primary", "size__link", "size-active");
              button.classList.remove("btn-outline-primary");
            } else {
              button.classList.remove("btn-primary", "size__link", "size-active");
              button.classList.add("btn-outline-primary");
            }
          });
        } else {
          alert("Combo not available.");
        }
      })
      .catch((error) => {
        console.error("Error fetching combo data:", error);
      });
  }

  // Attach the selectCombo function to the global scope
  window.selectCombo = selectCombo;
});