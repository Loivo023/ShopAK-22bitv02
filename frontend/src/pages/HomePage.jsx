import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import { productsApi } from "../api/productsApi";
import { useAuth } from "../auth/useAuth";

const HomePage = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productsApi.getAll({ page: 1, size: 8 });
        setBestsellers(data.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div style={{ backgroundColor: "#faf7f2" }}>
      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "48px 32px",
          display: "flex",
          gap: "48px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 380px", minWidth: "320px" }}>
          <p
            style={{
              fontSize: "0.78rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#c1662f",
              fontWeight: "600",
              marginBottom: "18px",
            }}
          >
            New Season Essentials
          </p>
          <h1
            style={{
              fontSize: "3.2rem",
              fontWeight: "400",
              color: "#2b2825",
              margin: "0 0 22px",
              lineHeight: "1.1",
              fontFamily: "Georgia, serif",
            }}
          >
            Everyday goods,
            <br />
            <span style={{ fontStyle: "italic" }}>thoughtfully</span> chosen
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#8a8378",
              maxWidth: "420px",
              margin: "0 0 32px",
              lineHeight: "1.7",
            }}
          >
            From tech to home essentials — a curated collection built around
            quality, simplicity, and honest pricing.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              to="/products"
              style={{
                display: "inline-block",
                padding: "15px 36px",
                backgroundColor: "#2b2825",
                color: "#faf7f2",
                borderRadius: "30px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "500",
                letterSpacing: "0.4px",
              }}
            >
              Shop Now →
            </Link>
            <span style={{ fontSize: "0.82rem", color: "#a39c8f" }}>
              {bestsellers.length > 0
                ? "40+ curated products"
                : "New collection"}
            </span>
          </div>
        </div>

        <div
          style={{
            flex: "1 1 380px",
            minWidth: "300px",
            position: "relative",
            borderRadius: "28px",
            overflow: "hidden",
            height: "440px",
          }}
        >
          <img
            src="https://haloshop.vn/wp-content/uploads/2025/07/MAY-PS4-SLIM-500GB-DRAGON-QUEST-LIMITED-EDITION_00.webp"
            alt="Featured collection"
            referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              backgroundColor: "rgba(250,247,242,0.95)",
              borderRadius: "18px",
              padding: "16px 20px",
              textAlign: "center",
              minWidth: "110px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "1.6rem",
                fontWeight: "700",
                color: "#2b2825",
              }}
            >
              4.9
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "0.7rem",
                color: "#a39c8f",
              }}
            >
              customer rating
            </p>
          </div>
        </div>
      </section>

      {/* ── Bestsellers ── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 32px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#c1662f",
                fontWeight: "600",
                margin: "0 0 6px",
              }}
            >
              Handpicked
            </p>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "1.9rem",
                fontWeight: "400",
                color: "#2b2825",
                margin: 0,
              }}
            >
              Bestselling Products
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              to="/products"
              style={{
                fontSize: "0.85rem",
                color: "#2b2825",
                textDecoration: "none",
                fontWeight: "500",
                borderBottom: "1px solid #2b2825",
              }}
            >
              More Products →
            </Link>
            <button onClick={() => scroll(-1)} style={arrowBtnStyle}>
              ‹
            </button>
            <button onClick={() => scroll(1)} style={arrowBtnStyle}>
              ›
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#a39c8f", fontFamily: "Georgia, serif" }}>
            Loading products...
          </p>
        ) : (
          <div
            ref={scrollRef}
            style={{
              display: "flex",
              gap: "20px",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              paddingBottom: "8px",
              scrollbarWidth: "none",
            }}
          >
            {bestsellers.map((p) => (
              <div
                key={p.id}
                style={{ scrollSnapAlign: "start", flexShrink: 0 }}
              >
                <ProductCard
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  category={p.category}
                  imageUrl={p.imageUrl}
                  description={p.description}
                  isAdmin={isAdmin}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA banner ── */}
      <section
        style={{
          backgroundColor: "#2b2825",
          padding: "70px 32px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "2rem",
            fontWeight: "400",
            color: "#faf7f2",
            margin: "0 0 16px",
          }}
        >
          Explore the full collection
        </h2>
        <p
          style={{
            color: "#a39c8f",
            maxWidth: "440px",
            margin: "0 auto 28px",
            lineHeight: "1.6",
          }}
        >
          Browse every category — electronics, home, fitness, and more — all in
          one place.
        </p>
        <Link
          to="/products"
          style={{
            display: "inline-block",
            padding: "14px 34px",
            backgroundColor: "#c1662f",
            color: "#fff",
            borderRadius: "30px",
            textDecoration: "none",
            fontSize: "0.88rem",
            fontWeight: "500",
          }}
        >
          Visit the Store
        </Link>
      </section>
    </div>
  );
};

const arrowBtnStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  border: "1px solid #ece6dc",
  backgroundColor: "#fff",
  color: "#2b2825",
  fontSize: "1.1rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default HomePage;
