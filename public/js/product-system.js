const baseUrl = "/admin-api";

// Shopping Cart Functions
function getCart() {
  const cart = localStorage.getItem("shoppingCart");
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem("shoppingCart", JSON.stringify(cart));
  updateCartIcon();
  if ($(".js-panel-cart").hasClass("show-header-cart")) {
    updateCartSidebar();
  }
  updateHeartIcons();
}

function isInCart(productId) {
  const cart = getCart();
  return cart.some((item) => item.id === productId);
}

function addToCart(product) {
  const cart = getCart();

  // Check if product already exists in cart
  if (!isInCart(product.id)) {
    cart.push({
      id: product.id,
      name: product.product_name,
      price: product.price,
      image: product.main_image_url,
    });

    saveCart(cart);
    return true;
  }
  return false;
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
}

function toggleCartItem(product) {
  if (isInCart(product.id)) {
    removeFromCart(product.id);
    return false;
  } else {
    addToCart(product);
    return true;
  }
}

function updateCartIcon() {
  const cart = getCart();
  const totalItems = cart.length;
  $(".icon-header-noti.js-show-cart").attr("data-notify", totalItems);
}

function updateCartSidebar() {
  const cart = getCart();
  const cartItemsContainer = $(".header-cart-wrapitem");
  const cartTotalElement = $(".header-cart-total");

  cartItemsContainer.empty();

  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.html(
      '<p class="stext-107 cl7 p-l-25">Your cart is empty</p>'
    );
    cartTotalElement.text("Total: ₦0");
    return;
  }

  cart.forEach((item) => {
    total += parseInt(item.price);

    const cartItemHTML = `
      <li class="header-cart-item flex-w flex-t m-b-12">
        <div class="header-cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>

        <div class="header-cart-item-txt p-t-8">
          <a href="#" class="header-cart-item-name m-b-18 hov-cl1 trans-04">
            ${item.name}
          </a>

          <span class="header-cart-item-info">
            ₦${item.price}
          </span>
        </div>
      </li>
    `;

    cartItemsContainer.append(cartItemHTML);
  });

  cartTotalElement.text(`Total: ₦${total}`);
}

function updateHeartIcons() {
  $(".btn-addwish-b2").each(function () {
    const productData = $(this).data("product");
    if (productData && isInCart(productData.id)) {
      $(this).addClass("js-addedwish-b2");
    } else {
      $(this).removeClass("js-addedwish-b2");
    }
  });
}

// Product Modal Functions
async function fetchProductDetails(productId) {
  try {
    const response = await fetch(`${baseUrl}/products/${productId}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Failed to fetch product details");
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
}

function createModalForProduct(product) {
  // Create a fresh modal for this product
  const modalHTML = `
    <div class="wrap-modal1 js-modal1 p-t-60 p-b-20">
      <div class="overlay-modal1 js-hide-modal1"></div>

      <div class="container">
        <div class="bg0 p-t-60 p-b-30 p-lr-15-lg how-pos3-parent">
          <button class="how-pos3 hov3 trans-04 js-hide-modal1">
            <img src="images/icons/icon-close.png" alt="CLOSE">
          </button>

          <div class="row">
            <div class="col-md-6 col-lg-7 p-b-30">
              <div class="p-l-25 p-r-30 p-lr-0-lg">
                <div class="wrap-slick3 flex-sb flex-w">
                  <div class="wrap-slick3-dots"></div>
                  <div class="wrap-slick3-arrows flex-sb-m flex-w"></div>
                  <div class="slick3 gallery-lb"></div>
                </div>
              </div>
            </div>

            <div class="col-md-6 col-lg-5 p-b-30">
              <div class="p-r-50 p-t-5 p-lr-0-lg">
                <h4 class="mtext-105 cl2 js-name-detail p-b-14"></h4>
                <span class="mtext-106 cl2"></span>
                <p class="stext-102 cl3 p-t-23"></p>

                <div class="p-t-33">
                  <div class="flex-w flex-r-m p-b-10">
                    <div class="size-203 flex-c-m respon6">Size</div>
                    <div class="size-204 respon6-next">
                      <div class="rs1-select2 bor8 bg0">
                        <select class="js-select2" name="size">
                          <option>Choose an option</option>
                        </select>
                        <div class="dropDownSelect2"></div>
                      </div>
                    </div>
                  </div>

                  <div class="flex-w flex-r-m p-b-10">
                    <div class="size-203 flex-c-m respon6">Color</div>
                    <div class="size-204 respon6-next">
                      <div class="rs1-select2 bor8 bg0">
                        <select class="js-select2" name="color">
                          <option>Choose an option</option>
                        </select>
                        <div class="dropDownSelect2"></div>
                      </div>
                    </div>
                  </div>

                  <div class="flex-w flex-r-m p-b-10">
                    <div class="size-204 flex-w flex-m respon6-next">
                      <button class="flex-c-m stext-101 cl0 size-101 bg1 bor1 hov-btn1 p-lr-15 trans-04 js-addcart-detail">
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex-w flex-m p-l-100 p-t-40 respon7">
                  <div class="flex-m bor9 p-r-10 m-r-11">
                    <a href="#" class="fs-14 cl3 hov-cl1 trans-04 lh-10 p-lr-5 p-tb-2 js-addwish-detail tooltip100" data-tooltip="Add to Wishlist">
                      <i class="zmdi zmdi-favorite"></i>
                    </a>
                  </div>

                  <a href="#" class="fs-14 cl3 hov-cl1 trans-04 lh-10 p-lr-5 p-tb-2 m-r-8 tooltip100" data-tooltip="Facebook">
                    <i class="fa fa-facebook"></i>
                  </a>

                  <a href="#" class="fs-14 cl3 hov-cl1 trans-04 lh-10 p-lr-5 p-tb-2 m-r-8 tooltip100" data-tooltip="Twitter">
                    <i class="fa fa-twitter"></i>
                  </a>

                  <a href="#" class="fs-14 cl3 hov-cl1 trans-04 lh-10 p-lr-5 p-tb-2 m-r-8 tooltip100" data-tooltip="Google Plus">
                    <i class="fa fa-google-plus"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add the modal to the body
  $("body").append(modalHTML);

  // Get the newly created modal
  const $modal = $(".wrap-modal1").last();

  // Populate the modal with product data
  populateModal($modal, product);

  // Set up event handlers for the new modal
  $modal.find(".js-hide-modal1").on("click", function () {
    $modal.remove();
  });

  // Close modal when clicking on overlay
  $modal.find(".overlay-modal1").on("click", function () {
    $modal.remove();
  });

  return $modal;
}

function populateModal($modal, product) {
  // Update basic product info
  $modal.find(".js-name-detail").text(product.product_name);
  $modal.find(".mtext-106.cl2").text(`₦${product.price}`);

  // Update description
  if (product.description) {
    $modal.find(".stext-102.cl3.p-t-23").text(product.description);
  } else {
    $modal.find(".stext-102.cl3.p-t-23").text("No description available.");
  }

  // Update images - main image and thumbnails
  updateModalImages($modal, product);

  // Update size options
  updateSizeOptions($modal, product.sizes || ["S", "M", "L", "XL"]);

  // Update color options
  updateColorOptions(
    $modal,
    product.colors || ["Red", "Blue", "White", "Black"]
  );

  // Set up add to cart button
  $modal
    .find(".js-addcart-detail")
    .off("click")
    .on("click", function () {
      const selectedSize = $modal.find('select[name="size"]').val();
      const selectedColor = $modal.find('select[name="color"]').val();

      addToCartWithOptions(product, selectedSize, selectedColor);
      $modal.remove();
    });

  // Set up wishlist button
  $modal
    .find(".js-addwish-detail")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      const added = toggleCartItem(product);

      if (added) {
        swal(product.product_name, "is added to cart!", "success");
      } else {
        swal(product.product_name, "is removed from cart!", "info");
      }
    });
}

function updateModalImages($modal, product) {
  const gallery = $modal.find(".gallery-lb");
  const dotsContainer = $modal.find(".wrap-slick3-dots");

  // Clear any existing content
  gallery.empty();
  dotsContainer.empty();

  // Always include the main image
  const allImages = [product.main_image_url];

  // Add other images if available
  if (product.other_images_urls && product.other_images_urls.length > 0) {
    allImages.push(...product.other_images_urls);
  }

  // Create slides for each image
  allImages.forEach((imageUrl, index) => {
    const slide = `
      <div class="item-slick3" data-thumb="${imageUrl}">
        <div class="wrap-pic-w pos-relative">
          <img src="${imageUrl}" alt="IMG-PRODUCT">
          <a class="flex-c-m size-108 how-pos1 bor0 fs-16 cl10 bg0 hov-btn3 trans-04" href="${imageUrl}">
            <i class="fa fa-expand"></i>
          </a>
        </div>
      </div>
    `;
    gallery.append(slide);
  });

  // Initialize slick slider
  if (typeof $.fn.slick === "function") {
    $modal.find(".slick3").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      fade: true,
      infinite: true,
      autoplay: false,
      autoplaySpeed: 6000,
      arrows: true,
      appendArrows: $modal.find(".wrap-slick3-arrows"),
      prevArrow:
        '<button class="arrow-slick3 prev-slick3"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
      nextArrow:
        '<button class="arrow-slick3 next-slick3"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
      dots: true,
      appendDots: dotsContainer,
      dotsClass: "slick3-dots",
      customPaging: function (slick, index) {
        var image = $(slick.$slides[index]).data("thumb");
        return '<img src="' + image + '">';
      },
    });
  }

  // Initialize magnificPopup for image expansion
  if (typeof $.fn.magnificPopup === "function") {
    gallery.magnificPopup({
      delegate: "a",
      type: "image",
      gallery: {
        enabled: true,
      },
      mainClass: "mfp-fade",
    });
  }
}

function updateSizeOptions($modal, sizes) {
  const sizeSelect = $modal.find('select[name="size"]');
  sizeSelect.empty();
  sizeSelect.append("<option>Choose an option</option>");

  sizes.forEach((size) => {
    sizeSelect.append(`<option value="${size}">Size ${size}</option>`);
  });

  // Initialize select2
  if (typeof $.fn.select2 === "function") {
    sizeSelect.select2({
      minimumResultsForSearch: 20,
      dropdownParent: sizeSelect.next(".dropDownSelect2"),
    });
  }
}

function updateColorOptions($modal, colors) {
  const colorSelect = $modal.find('select[name="color"]');
  colorSelect.empty();
  colorSelect.append("<option>Choose an option</option>");

  colors.forEach((color) => {
    colorSelect.append(`<option value="${color}">${color}</option>`);
  });

  // Initialize select2
  if (typeof $.fn.select2 === "function") {
    colorSelect.select2({
      minimumResultsForSearch: 20,
      dropdownParent: colorSelect.next(".dropDownSelect2"),
    });
  }
}

function addToCartWithOptions(product, size, color) {
  const cartItem = {
    id: product.id,
    name: product.product_name,
    price: product.price,
    image: product.main_image_url,
    size: size,
    color: color,
  };

  // Check if already in cart
  if (!isInCart(product.id)) {
    addToCart(cartItem);
    swal(product.product_name, "is added to cart!", "success");
  } else {
    swal(product.product_name, "is already in your cart!", "info");
  }
}

// Show loading state
function showLoading() {
  document.getElementById("productsLoading").style.display = "flex";
  document.getElementById("productsError").style.display = "none";
  document.getElementById("productsContainer").style.display = "none";
  document.getElementById("loadMoreContainer").style.display = "none";
}

// Show error state
function showError() {
  document.getElementById("productsLoading").style.display = "none";
  document.getElementById("productsError").style.display = "flex";
  document.getElementById("productsContainer").style.display = "none";
  document.getElementById("loadMoreContainer").style.display = "none";
}

// Show products
function showProducts() {
  document.getElementById("productsLoading").style.display = "none";
  document.getElementById("productsError").style.display = "none";
  document.getElementById("productsContainer").style.display = "flex";
  document.getElementById("loadMoreContainer").style.display = "flex";
}

// Show empty state (no products)
function showEmpty() {
  document.getElementById("productsLoading").style.display = "none";
  document.getElementById("productsError").style.display = "flex";
  document.getElementById("productsError").innerHTML = `
    <i class="zmdi zmdi-shopping-basket"></i>
    <h4>No Products Available</h4>
    <p>We don't have any products in our collection at the moment. Please check back later.</p>
  `;
  document.getElementById("productsContainer").style.display = "none";
  document.getElementById("loadMoreContainer").style.display = "none";
}

async function getAllProducts() {
  try {
    const response = await fetch(`${baseUrl}/products`, {
      method: "GET",
    });

    if (response.ok) {
      const products = await response.json();
      return products;
    } else {
      throw new Error("Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

async function renderProducts() {
  showLoading();

  try {
    const products = await getAllProducts();
    const productsContainer = document.getElementById("productsContainer");

    // Clear existing content
    productsContainer.innerHTML = "";

    // Check if we have products
    if (products && products.length > 0) {
      // Add products to the container
      products.forEach((product) => {
        const productElement = document.createElement("div");
        productElement.className = `col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item ${product.category}`;

        productElement.innerHTML = `
          <div class="block2">
            <div class="block2-pic hov-img0">
              <img src="${product.main_image_url}" alt="${
          product.product_name
        }">
              <a href="#" class="block2-btn flex-c-m stext-103 cl2 size-102 bg0 bor2 hov-btn1 p-lr-15 trans-04 js-show-modal1" data-product-id="${
                product.id
              }">
                Quick View
              </a>
            </div>
            <div class="block2-txt flex-w flex-t p-t-14">
              <div class="block2-txt-child1 flex-col-l">
                <a href="product-detail.html" class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6">
                  ${product.product_name}
                </a>
                <span class="stext-105 cl3">₦${product.price}</span>
              </div>
              <div class="block2-txt-child2 flex-r p-t-3">
                <a href="#" class="btn-addwish-b2 dis-block pos-relative js-addwish-b2" data-product='${JSON.stringify(
                  product
                ).replace(/'/g, "&#39;")}'>
                  <img class="icon-heart1 dis-block trans-04" src="images/icons/icon-heart-01.png" alt="ICON">
                  <img class="icon-heart2 dis-block trans-04 ab-t-l" src="images/icons/icon-heart-02.png" alt="ICON">
                </a>
              </div>
            </div>
          </div>
        `;

        productsContainer.appendChild(productElement);
      });

      showProducts();

      // Initialize wishlist/cart buttons
      initWishlistHandlers();

      // Update heart icons based on cart contents
      updateHeartIcons();

      // Reinitialize modal handlers for the new products
      initModalHandlers();

      // Reinitialize isotope if it exists
      if (typeof $.fn.isotope === "function") {
        setTimeout(() => {
          $(".isotope-grid").isotope("reloadItems").isotope({ filter: "*" });
        }, 100);
      }
    } else {
      // No products available
      showEmpty();
    }
  } catch (error) {
    console.error("Error rendering products:", error);
    showError();
  }
}

function initWishlistHandlers() {
  // Remove any existing handlers first to prevent duplication
  $(".js-addwish-b2").off("click");

  $(".js-addwish-b2").on("click", function (e) {
    e.preventDefault();
    const productData = $(this).data("product");
    const added = toggleCartItem(productData);

    // Show appropriate message
    if (added) {
      swal(productData.product_name, "is added to cart!", "success");
    } else {
      swal(productData.product_name, "is removed from cart!", "info");
    }
  });
}

function initModalHandlers() {
  // Remove any existing handlers first to prevent duplication
  $(".js-show-modal1").off("click");

  // Add click handlers for modal buttons
  $(".js-show-modal1").on("click", function (e) {
    e.preventDefault();
    const $button = $(this);
    const productId = $button.data("product-id");

    // Show loading state on the button
    $button.addClass("loading").html('<div class="button-spinner"></div>');

    showProductModal(productId, $button);
  });
}

async function showProductModal(productId, $button) {
  try {
    // Fetch product details
    const product = await fetchProductDetails(productId);

    // Create a fresh modal for this product
    const $modal = createModalForProduct(product);

    // Show the modal by adding the show-modal1 class
    $modal.addClass("show-modal1");

    // Reset button state
    if ($button) {
      $button.removeClass("loading").text("Quick View");
    }
  } catch (error) {
    console.error("Error loading product details:", error);

    // Reset button state
    if ($button) {
      $button.removeClass("loading").text("Quick View");
    }

    swal("Error", "Error loading product details. Please try again.", "error");
  }
}

function retryLoadingProducts() {
  renderProducts();
}

// Initialize when document is ready
$(document).ready(function () {
  // Add CSS for button loading state
  const loadingStyles = `
    .block2-btn.loading {
      pointer-events: none;
      opacity: 0.7;
    }
    
    .button-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top: 2px solid #fff;
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  $("head").append("<style>" + loadingStyles + "</style>");

  // Initialize cart icon
  updateCartIcon();

  // Initialize cart sidebar
  $(".js-show-cart").on("click", function (e) {
    e.preventDefault();
    updateCartSidebar();
  });

  renderProducts();
});
