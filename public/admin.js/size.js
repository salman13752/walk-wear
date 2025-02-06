document.addEventListener('DOMContentLoaded', () => {
  function selectCombo(button) {
    
    const productId = button.dataset.productId;
    const comboId = button.getAttribute('data-combos-id');
    const size = button.dataset.size;

    
    fetch(`/productDetails/combo/${productId}?size=${size}&comboId=${comboId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
      
          document.getElementById("currentPrice").innerHTML = `<span> ₹${data.combo.salePrice.toLocaleString()} </span>`;
          document.getElementById("regularPrice").innerHTML = `<del>₹${data.combo.regularPrice.toLocaleString()}</del>`;

    
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




  $('#slider').owlCarousel({
    items: 1,
    loop: true,
    autoplay: true,
    dots: true,
  });
  $('#thumb').owlCarousel({
    items: 4,
    margin: 10,
    dots: true,
    autoplay: true,
    
  });

  
document.addEventListener("DOMContentLoaded", function () {

  const images = document.querySelectorAll("#slider .item img");

  
  images.forEach((image) => {
    const panzoomInstance = Panzoom(image, {
      maxScale: 3, 
      contain: "outside", 
    });

    
    image.parentElement.addEventListener("wheel", panzoomInstance.zoomWithWheel);
  });
});



document.querySelector(".qtyminus").addEventListener("click", function () {
        let qty = document.querySelector("#quantity");
        let value = parseInt(qty.value);
        if (value > 1) qty.value = value - 1;
    });

    document.querySelector(".qtyplus").addEventListener("click", function () {
        let qty = document.querySelector("#quantity");
        let value = parseInt(qty.value);
        qty.value = value + 1;
    });
