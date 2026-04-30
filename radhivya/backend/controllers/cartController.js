const Cart = require("../models/Cart");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findOne({ user: userId }).populate("items.product");
  }
  return cart;
};

const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart", error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const cart = await getOrCreateCart(req.user._id);

    const existingItem = cart.items.find(
      (item) => item.product._id.toString() === productId
    );

    if (existingItem) {
      existingItem.qty += qty || 1;
    } else {
      cart.items.push({ product: productId, qty: qty || 1 });
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to add to cart", error: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const cart = await getOrCreateCart(req.user._id);

    const item = cart.items.find(
      (i) => i.product._id.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.qty = qty;
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart", error: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id);

    cart.items = cart.items.filter(
      (item) => item.product._id.toString() !== productId
    );

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove cart item", error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };