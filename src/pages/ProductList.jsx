import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { Link } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [sortBy, setSortBy] = useState("name");

  const [formData, setFormData] = useState({
    imageUrl: "",
    name: "",
    count: 1,
    size: { width: "", height: "" },
    weight: "",
    comments: [],
  });

  // automaticallly download db
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "width" || name === "height") {
      setFormData((prev) => ({
        ...prev,
        size: { ...prev.size, [name]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Product name is required!");
      return;
    }

    if (editingProduct) {
      // edit
      const updatedProduct = {
        ...editingProduct,
        ...formData,
        count: Number(formData.count),
        size: {
          width: Number(formData.size.width),
          height: Number(formData.size.height),
        },
      };

      await fetch(`http://localhost:3000/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });
    } else {
      // add
      const newProduct = {
        ...formData,
        id: Date.now().toString(),
        count: Number(formData.count),
        size: {
          width: Number(formData.size.width),
          height: Number(formData.size.height),
        },
        comments: [],
      };

      await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
    }

    await fetchProducts();

    setFormData({
      imageUrl: "",
      name: "",
      count: 1,
      size: { width: "", height: "" },
      weight: "",
      comments: [],
    });
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      imageUrl: product.imageUrl,
      name: product.name,
      count: product.count,
      size: {
        width: product.size?.width || "",
        height: product.size?.height || "",
      },
      weight: product.weight,
      comments: product.comments || [],
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    await fetch(`http://localhost:3000/products/${deletingProduct.id}`, {
      method: "DELETE",
    });

    await fetchProducts();
    setDeletingProduct(null);
    setIsDeleteModalOpen(false);
  };

  // sort
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "count") {
      return b.count - a.count;
    }
    return 0;
  });

  return (
    <div>
      <h1>Products</h1>

      <div>
        {/* add */}
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
        >
          Add Product
        </button>

        {/* dropdown */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name (A-Z)</option>
          <option value="count">Sort by Count</option>
        </select>
      </div>

      {/* products list */}
      <ul>
        {sortedProducts.map((p) => (
          <li key={p.id}>
            <span>
              {p.name} ({p.count})
            </span>
            <div>
              <Link to={`/product/${p.id}`}>View</Link>
              <button onClick={() => openEditModal(p)}>Edit</button>
              <button onClick={() => openDeleteModal(p)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {/* add/edit modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit}>
          {/* download img */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
              };
              reader.readAsDataURL(file);
            }}
          />

          {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" />}

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Product Name"
          />
          <input
            type="number"
            name="count"
            value={formData.count}
            onChange={handleChange}
            placeholder="Count"
            min="1"
          />
          <div className="flex gap-2">
            <input
              type="number"
              name="width"
              value={formData.size.width}
              onChange={handleChange}
              placeholder="Width"
            />
            <input
              type="number"
              name="height"
              value={formData.size.height}
              onChange={handleChange}
              placeholder="Height"
            />
          </div>
          <input
            type="text"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Weight (e.g. 200g)"
          />

          {/* form validation */}
          <div>
            <button type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !formData.name.trim() ||
                !formData.imageUrl ||
                !formData.count ||
                !formData.size.width ||
                !formData.size.height ||
                !formData.weight.trim()
              }
              className={`px-4 py-2 rounded text-white ${
                formData.name.trim() &&
                formData.imageUrl &&
                formData.count &&
                formData.size.width &&
                formData.size.height &&
                formData.weight.trim()
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-green-300 cursor-not-allowed"
              }`}
            >
              {editingProduct ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* deleting confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <h2>Delete Product</h2>
        <p>
          Are you sure you want to delete{" "}
          <strong>{deletingProduct?.name}</strong>?
        </p>
        <div>
          <button onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
