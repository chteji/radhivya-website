export function getCartItems() {
  return JSON.parse(localStorage.getItem("radhivyaCart")) || [];
}

export function saveCartItems(items) {
  localStorage.setItem("radhivyaCart", JSON.stringify(items));
}

export function isProductInCart(productId) {
  const cart = getCartItems();
  return cart.some((item) => item.id === productId);
}

export function addProductToCart(product) {
  const cart = getCartItems();

  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    return {
      status: "exists",
      cart,
    };
  }

  const newItem = {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    old_price: product.old_price,
    image: getProductImage(product),
    quantity: 1,
    stock: product.stock,
  };

  const updatedCart = [...cart, newItem];
  saveCartItems(updatedCart);

  return {
    status: "added",
    cart: updatedCart,
  };
}

export function removeProductFromCart(productId) {
  const cart = getCartItems();
  const updatedCart = cart.filter((item) => item.id !== productId);
  saveCartItems(updatedCart);

  return {
    status: "removed",
    cart: updatedCart,
  };
}

export function toggleProductInCart(product) {
  if (isProductInCart(product.id)) {
    return removeProductFromCart(product.id);
  }

  return addProductToCart(product);
}

export function removeCartItem(productId) {
  const cart = getCartItems();
  const updatedCart = cart.filter((item) => item.id !== productId);
  saveCartItems(updatedCart);
  return updatedCart;
}

export function updateCartQuantity(productId, quantity) {
  if (quantity <= 0) {
    return removeCartItem(productId);
  }

  const cart = getCartItems();

  const updatedCart = cart.map((item) =>
    item.id === productId ? { ...item, quantity } : item
  );

  saveCartItems(updatedCart);
  return updatedCart;
}

export function getWishlistItems() {
  return JSON.parse(localStorage.getItem("radhivyaWishlist")) || [];
}

export function saveWishlistItems(items) {
  localStorage.setItem("radhivyaWishlist", JSON.stringify(items));
}

export function isProductInWishlist(productId) {
  const wishlist = getWishlistItems();
  return wishlist.some((item) => item.id === productId);
}

export function addProductToWishlist(product) {
  const wishlist = getWishlistItems();

  const alreadyExists = wishlist.some((item) => item.id === product.id);

  if (alreadyExists) {
    return {
      status: "exists",
      wishlist,
    };
  }

  const newItem = {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    old_price: product.old_price,
    image: getProductImage(product),
    stock: product.stock,
    short_description: product.short_description,
  };

  const updatedWishlist = [...wishlist, newItem];
  saveWishlistItems(updatedWishlist);

  return {
    status: "added",
    wishlist: updatedWishlist,
  };
}

export function removeWishlistItem(productId) {
  const wishlist = getWishlistItems();
  const updatedWishlist = wishlist.filter((item) => item.id !== productId);
  saveWishlistItems(updatedWishlist);
  return updatedWishlist;
}

export function removeProductFromWishlist(productId) {
  const wishlist = getWishlistItems();
  const updatedWishlist = wishlist.filter((item) => item.id !== productId);
  saveWishlistItems(updatedWishlist);

  return {
    status: "removed",
    wishlist: updatedWishlist,
  };
}

export function toggleProductInWishlist(product) {
  if (isProductInWishlist(product.id)) {
    return removeProductFromWishlist(product.id);
  }

  return addProductToWishlist(product);
}

export function getProductImage(product) {
  const mainImage = product.product_images?.find((img) => img.is_main);
  const firstImage = product.product_images?.[0];

  return mainImage?.image_url || firstImage?.image_url || "/logo-transparent.png";
}