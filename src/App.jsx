import { Routes, Route, Link } from "react-router-dom";
import ProductList from "./pages/ProductList";
import ProductView from "./pages/ProductView";

function App() {
  return (
    <div>
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <Link to="/">Products</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductView />} />
      </Routes>
    </div>
  );
}

export default App;
