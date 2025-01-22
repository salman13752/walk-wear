
const publishButton = document.getElementById("publishBtn");
publishButton.addEventListener("click", validateAndSubmit);



function validateAndSubmit(event) {
  event.preventDefault();

  if (validateForm()) {
    let combos = [];
    const comboRows = document.querySelectorAll(".combo-row");

    comboRows.forEach((row) => {
      const Size = row.querySelector('input[name="Size"]').value.trim();
      const Colour = row.querySelector('input[name="Colour"]').value.trim();
      const quantity = row.querySelector('input[name="quantity"]').value.trim();
      const regularPrice = row.querySelector('input[name="regularPrice"]').value.trim();
      const salePrice = row.querySelector('input[name="salePrice"]').value.trim();

      if (Size && Colour && quantity && regularPrice && salePrice) {
        combos.push({ Size, Colour, quantity, regularPrice, salePrice });
      }
    });

    // Remove existing combos field
    const existingCombosField = document.querySelector('input[name="combos"]');
    if (existingCombosField) existingCombosField.remove();

    // Add combos field
    const combosField = document.createElement("input");
    combosField.type = "hidden";
    combosField.name = "combos";
    combosField.value = JSON.stringify(combos);
    document.forms[0].appendChild(combosField);

    // Submit form via Fetch
    const formData = new FormData(document.forms[0]);
    fetch(document.forms[0].action, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.headers.get("content-type")?.includes("application/json")) {
          return response.json();
        } else {
          return response.text().then((text) => {
            throw new Error(`Unexpected response: ${text}`);
          });
        }
      })
      .then((data) => {
        Swal.fire({
          icon: "success",
          title: "Added Successfully",
          text: data.message,
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "/admin/addProducts";
        });
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while adding the product.",
          timer: 1000,
          showConfirmButton: false,
        });
      });
  }
}








// View Image and Enable Cropping
function viewImage(event, index) {
  const input = event.target;
  const reader = new FileReader();

  //to show image
  reader.onload = () => {
    const dataURL = reader.result;
    const image = document.getElementById("imgView" + index);
    image.src = dataURL;

   
    const cropper = new Cropper(image, {
      aspectRatio: NaN,
      viewMode: 2, 
      guides: true,
      background: false,
      autoCropArea: 1, 
      zoomable: true,
      ready() {
        const containerData = this.cropper.getContainerData();
        
       
        this.cropper.setCropBoxData({
          left: 0, 
          top: 0,  
          width: containerData.width,  
          height: containerData.height, 
        });
      },
    });
    




    const cropperContainer = document.querySelector(
      "#croppedImg" + index
    ).parentNode;
    cropperContainer.style.display = "block";

    const saveButton = document.querySelector("#saveButton" + index);
    saveButton.addEventListener("click", async () => {
      //creating cropper container
      const croppedCanvas = cropper.getCroppedCanvas({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      const croppedImage = document.getElementById("croppedImg" + index);
      croppedImage.src = croppedCanvas.toDataURL("image/png");
      const timestamp = new Date().getTime();
      const fileName = `cropped-img-${timestamp}-${index}.png`;

      await croppedCanvas.toBlob((blob) => {
        const input = document.getElementById("input" + index);
        const imgFile = new File([blob], fileName, { type: blob.type });
        const fileList = new DataTransfer();
        fileList.items.add(imgFile);
        input.files = fileList.files;
      });

      cropperContainer.style.display = "none";
      cropper.destroy();
    });
  };

  reader.readAsDataURL(input.files[0]);
}

function validateForm() {
  clearErrorMessages();
  let isValid = true;

  const comboSet = new Set();

  // Validate Product Name
  const name = document.getElementsByName("productName")[0].value.trim();
  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    displayErrorMessage(
      "productName-error",
      "Product name should contain only alphabetic characters and numbers."
    );
    isValid = false;
  }

  // Validate Product Description
  const description = document.getElementById("descriptionid").value.trim();
  if (!/.+/.test(description)) {
    displayErrorMessage(
      "description-error",
      "Product description cannot be empty."
    );
    isValid = false;
  }

  // Validate Combos
  const combos = document.querySelectorAll(".combo-row");
  combos.forEach((combo, index) => {
    const Size = combo.querySelector('input[name="Size"]').value.trim();
    const Colour = combo.querySelector('input[name="Colour"]').value.trim();
    const quantity = combo.querySelector('input[name="quantity"]').value.trim();
    const regularPrice = combo
      .querySelector('input[name="regularPrice"]')
      .value.trim();
    const salePrice = combo
      .querySelector('input[name="salePrice"]')
      .value.trim();
    

    // Check if any field is empty 
    if (Size === "") {
      displayErrorMessage(`comboSize-error-${index}`, "This is Empty");
      isValid = false;
    }

    if (Colour === "") {
      displayErrorMessage(`comboColour-error-${index}`, "This is Empty");
      isValid = false;
    }

    if (quantity === "") {
      displayErrorMessage(`comboQuantity-error-${index}`, "This is Empty");
      isValid = false;
    }

    if (regularPrice === "") {
      displayErrorMessage(`comboReg-error-${index}`, "This is Empty");
      isValid = false;
    }

    if (salePrice === "") {
      displayErrorMessage(`comboSale-error-${index}`, "This is Empty");
      isValid = false;
    }

    

    // checking if regular price is greater than sale price
    if (parseFloat(regularPrice) <= parseFloat(salePrice)) {
      displayErrorMessage(
        `comboReg-error-${index}`,
        "Regular price must be greater than sale price."
      );
      isValid = false;
    }

    // Checing for duplicate combos
    const comboKey = `${Size}-${Colour}-${regularPrice}-${salePrice}`;
    if (comboSet.has(comboKey)) {
      displayErrorMessage(`combo-error-${index}`, "Duplicate combo detected.");
      isValid = false;
    } else {
      comboSet.add(comboKey); // Add comboKey to the set if unique
    }
  });

  // Validate Images
  const images = document.querySelectorAll('input[type="file"]');
  let imageCount = 0;
  images.forEach((input) => {
    if (input.files.length > 0) imageCount++;
  });
  if (imageCount < 2) {
    displayErrorMessage(
      "images-error",
      "At least two images must be selected."
    );
    isValid = false;
  }

  return isValid; // Return the overall validation result
}

// Display and Clear Error Messages
function displayErrorMessage(elementId, message) { 
  const errorElement = document.getElementById(elementId);
  errorElement.innerText = message;
  errorElement.style.display = "block";
  errorElement.classList.add("shake");
  setTimeout(() => {
    errorElement.classList.remove("shake");
  }, 500);
}

function clearErrorMessages() {
  const errorElements = document.getElementsByClassName("error-message");
  Array.from(errorElements).forEach((element) => {
    element.innerText = "";
    element.style.display = "none";
  });
}

const addComboBtn = document.getElementById("addComboBtn");
const productCombosContainer = document.getElementById("product-combos");

// Add Event Listener for "Add Another Combo" Button
addComboBtn.addEventListener("click", () => {
  // Create a new combo row
  const newRow = document.createElement("div");
  newRow.classList.add("row", "combo-row");

  const comboIndex = document.querySelectorAll(".combo-row").length;

  newRow.innerHTML = `
        <div class="col-lg-3">
            <label class="form-label">Size</label>
            <input name="Size" type="text" class="form-control border" required>
            <div id="comboSize-error-${comboIndex}" class="error-message"></div>
        </div>
        <div class="col-lg-3">
            <label class="form-label">Colour</label>
            <input name="Colour" type="text" class="form-control border" required>
            <div id="comboColour-error-${comboIndex}" class="error-message"></div>
        </div>
        <div class="col-lg-3">
            <label class="form-label">Quantity</label>
            <input name="quantity" type="number" class="form-control border" required>
            <div id="comboQuantity-error-${comboIndex}" class="error-message"></div>
        </div>
        <div class="col-lg-3">
            <label class="form-label">Regular Price</label>
            <input name="regularPrice" type="number" class="form-control border" required>
            <div id="comboReg-error-${comboIndex}" class="error-message"></div>
        </div>
        <div class="col-lg-3">
            <label class="form-label">Sale Price</label>
            <input name="salePrice" type="number" class="form-control border" required>
            <div id="comboSale-error-${comboIndex}" class="error-message"></div>
        </div>
        
        <div class="col-lg-3 d-flex align-items-center">
            <button type="button" class="btn btn-danger delete-combo-btn">Delete</button>
        </div>
    `;

  // Append the new row to the product-combos container
  productCombosContainer.appendChild(newRow);

  // Attach delete functionality to the "Delete" button of the new row
  newRow
    .querySelector(".delete-combo-btn")
    .addEventListener("click", handleDeleteRow);
});

// Function to Handle Row Deletion
function handleDeleteRow() {
  const comboRows = document.querySelectorAll(".combo-row");

  // Prevent deletion if it's the only remaining row
  if (comboRows.length > 1) {
    this.closest(".combo-row").remove(); // Remove the current row
  } else {
    alert("At least one combo is required."); // Alert the user
  }
}

// Add event listeners for existing delete buttons (if any)
document.querySelectorAll(".delete-combo-btn").forEach((btn) => {
  btn.addEventListener("click", handleDeleteRow);
});