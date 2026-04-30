const express = require("express");
const supabase = require("../config/supabase");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

function createSlug(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// PUBLIC: Get all visible products
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      products: data || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// PUBLIC: Get single product
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images(*)
      `)
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      product: data,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Product not found",
      error: error.message,
    });
  }
});

// ADMIN ONLY: Create product
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      short_description,
      description,
      price,
      old_price,
      stock,
      status,
      is_bestseller,
      is_featured,
      is_new_arrival,
      is_available,
      skin_type,
      ingredients,
      how_to_use,
      category,
      category_slug,
      image_url,
      gallery_images,
      sku,
      brand,
    } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product name, price, and stock are required.",
      });
    }

    const finalSlug = slug || createSlug(name);
    const finalCategorySlug = category_slug || createSlug(category);

    const productPayload = {
      name,
      slug: finalSlug,
      short_description,
      description,
      price: Number(price),
      old_price: old_price ? Number(old_price) : null,
      stock: Number(stock),
      status: status || "active",
      is_bestseller: Boolean(is_bestseller),
      is_featured: Boolean(is_featured),
      is_new_arrival: Boolean(is_new_arrival),
      is_available: is_available === false ? false : true,
      skin_type,
      ingredients,
      how_to_use,
      category,
      category_slug: finalCategorySlug,
      image_url,
      gallery_images: gallery_images || [],
      sku,
      brand: brand || "Radhivya",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("products")
      .insert([productPayload])
      .select()
      .single();

    const imagesToSave = [];

if (image_url) {
  imagesToSave.push({
    product_id: data.id,
    image_url,
    alt_text: name,
    is_main: true,
  });
}

if (Array.isArray(gallery_images)) {
  gallery_images.forEach((url) => {
    if (url && url !== image_url) {
      imagesToSave.push({
        product_id: data.id,
        image_url: url,
        alt_text: name,
        is_main: false,
      });
    }
  });
}

if (imagesToSave.length > 0) {
  await supabase.from("product_images").insert(imagesToSave);
}

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
});

// ADMIN ONLY: Update product
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      short_description,
      description,
      price,
      old_price,
      stock,
      status,
      is_bestseller,
      is_featured,
      is_new_arrival,
      is_available,
      skin_type,
      ingredients,
      how_to_use,
      category,
      category_slug,
      image_url,
      gallery_images,
      sku,
      brand,
    } = req.body;

    const updatePayload = {
      name,
      slug: slug || createSlug(name),
      short_description,
      description,
      price: price !== undefined ? Number(price) : undefined,
      old_price: old_price ? Number(old_price) : null,
      stock: stock !== undefined ? Number(stock) : undefined,
      status,
      is_bestseller: Boolean(is_bestseller),
      is_featured: Boolean(is_featured),
      is_new_arrival: Boolean(is_new_arrival),
      is_available: is_available === false ? false : true,
      skin_type,
      ingredients,
      how_to_use,
      category,
      category_slug: category_slug || createSlug(category),
      image_url,
      gallery_images: gallery_images || [],
      sku,
      brand: brand || "Radhivya",
      updated_at: new Date().toISOString(),
    };

    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (image_url || Array.isArray(gallery_images)) {
  await supabase.from("product_images").delete().eq("product_id", req.params.id);

  const imagesToSave = [];

  if (image_url) {
    imagesToSave.push({
      product_id: req.params.id,
      image_url,
      alt_text: name,
      is_main: true,
    });
  }

  if (Array.isArray(gallery_images)) {
    gallery_images.forEach((url) => {
      if (url && url !== image_url) {
        imagesToSave.push({
          product_id: req.params.id,
          image_url: url,
          alt_text: name,
          is_main: false,
        });
      }
    });
  }

  if (imagesToSave.length > 0) {
    await supabase.from("product_images").insert(imagesToSave);
  }
}

    res.json({
      success: true,
      message: "Product updated successfully",
      product: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// ADMIN ONLY: Delete product
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

module.exports = router;