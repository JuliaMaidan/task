import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    fetch(`http://localhost:3000/comments?productId=${id}`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [id]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      productId: id,
      description: newComment,
      date: new Date().toLocaleString(),
    };

    fetch("http://localhost:3000/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    }).then(() => {
      setComments([...comments, comment]);
      setNewComment("");
    });
  };

  const handleDeleteComment = (commentId) => {
    fetch(`http://localhost:3000/comments/${commentId}`, {
      method: "DELETE",
    }).then(() => {
      setComments(comments.filter((c) => c.id !== commentId));
    });
  };

  if (error)
    return <p style={{ color: "red" }}>Error loading product: {error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <h1>
        {product.name}
      </h1>
      <p>Count: {product.count}</p>
      <p>Weight: {product.weight}</p>
      <img src={product.imageUrl} alt={product.name} width="200" />

      {/* comments */}
      <h2>
        Comments
      </h2>
      <ul>
        {comments.map((c) => (
          <li
            key={c.id}
          >
            <span>
              {c.description} <br />
              <small>{c.date}</small>
            </span>
            <button
              onClick={() => handleDeleteComment(c.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* add comment */}
      <div>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Enter comment"
        />
        <button
          onClick={handleAddComment}
        >
          Add
        </button>
      </div>

      {/* back to list */}
      <div>
        <button
          onClick={() => navigate("/")}
        >
          Back to list
        </button>
      </div>
    </div>
  );
}
