import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import { useCart } from "../context/CartContext";
import { formatUSD, formatVND } from "../utils/currency";
import { recentlyViewedApi } from "../api/extrasApi";
import { useAuth } from "../auth/useAuth";
import { reviewsApi } from "../api/reviewsApi";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({
    review_count: 0,
    average_rating: 0,
  });

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setAdded(false);
        setQty(1);

        const data = await productsApi.getById(id);
        setProduct(data);

        if (isAuthenticated) {
          recentlyViewedApi.track(id);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isAuthenticated]);

  const loadReviews = async () => {
    try {
      const [reviewData, summaryData] = await Promise.all([
        reviewsApi.getProductReviews(product.id),
        reviewsApi.getProductRatingSummary(product.id),
      ]);

      setReviews(reviewData || []);
      setRatingSummary(
        summaryData || {
          review_count: 0,
          average_rating: 0,
        },
      );
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    setReviewError("");
    setReviewSuccess("");
    setReviewLoading(true);

    try {
      await reviewsApi.createReview(
        product.id,
        reviewRating,
        reviewComment.trim() || null,
      );

      setReviewComment("");
      setReviewRating(5);

      await loadReviews();

      setReviewSuccess("Your review has been submitted.");
    } catch (err) {
      const detail = err?.response?.data?.detail;

      setReviewError(
        typeof detail === "string" ? detail : "Unable to submit your review.",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (product?.id) {
      loadReviews();
    }
  }, [product?.id]);

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px 24px",
          color: "#a39c8f",
          backgroundColor: "#faf7f2",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid #ece6dc",
            borderTop: "3px solid #c1662f",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: "Georgia, serif" }}>Loading product...</p>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          padding: "100px 24px",
          textAlign: "center",
          backgroundColor: "#faf7f2",
        }}
      >
        <p style={{ color: "#c14f2f", marginBottom: "20px" }}>{error}</p>
        <Link
          to="/products"
          style={{
            color: "#2b2825",
            borderBottom: "1px solid #2b2825",
            textDecoration: "none",
          }}
        >
          ← Back to Shop
        </Link>
      </div>
    );

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div style={{ backgroundColor: "#faf7f2", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "36px 32px 90px",
        }}
      >
        <p
          style={{
            fontSize: "0.78rem",
            color: "#8a8378",
            marginBottom: "28px",
          }}
        >
          <Link to="/" style={{ color: "#8a8378", textDecoration: "none" }}>
            Home
          </Link>
          {" / "}
          <Link
            to="/products"
            style={{ color: "#8a8378", textDecoration: "none" }}
          >
            Shop
          </Link>
          {" / "}
          <span style={{ color: "#2b2825" }}>{product.name}</span>
        </p>

        <div style={{ display: "flex", gap: "56px", flexWrap: "wrap" }}>
          {/* Image */}
          <div
            style={{
              flex: "1 1 420px",
              minWidth: "320px",
              borderRadius: "24px",
              overflow: "hidden",
              backgroundColor: "#f0e4d8",
              height: "480px",
            }}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/500x500/f0e4d8/8a8378?text=No+Image";
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Info */}
          <div
            style={{
              flex: "1 1 380px",
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <span
              style={{
                alignSelf: "flex-start",
                fontSize: "0.72rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#c1662f",
                fontWeight: "600",
              }}
            >
              {product.category}
            </span>

            <h1
              style={{
                margin: 0,
                fontFamily: "Georgia, serif",
                fontSize: "2.1rem",
                fontWeight: "400",
                color: "#2b2825",
                lineHeight: "1.25",
              }}
            >
              {product.name}
            </h1>

            <div
              style={{ display: "flex", alignItems: "baseline", gap: "10px" }}
            >
              <span
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "600",
                  color: "#c1662f",
                }}
              >
                {formatUSD(product.price)}
              </span>
              <span style={{ fontSize: "0.9rem", color: "#a39c8f" }}>
                {formatVND(product.price)}
              </span>
            </div>

            <p
              style={{
                margin: "8px 0",
                color: "#5c574d",
                lineHeight: "1.8",
                fontSize: "0.95rem",
              }}
            >
              {product.description}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  border: "1px solid #ece6dc",
                  borderRadius: "30px",
                  padding: "6px 8px",
                }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  style={{
                    width: "30px",
                    height: "30px",
                    border: "none",
                    borderRadius: "50%",
                    backgroundColor: "#f0e4d8",
                    color: "#2b2825",
                    cursor: "pointer",
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    minWidth: "20px",
                    textAlign: "center",
                    color: "#2b2825",
                    fontWeight: "500",
                  }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  style={{
                    width: "30px",
                    height: "30px",
                    border: "none",
                    borderRadius: "50%",
                    backgroundColor: "#f0e4d8",
                    color: "#2b2825",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: "15px 32px",
                  backgroundColor: added ? "#5a7d5a" : "#2b2825",
                  color: "#faf7f2",
                  border: "none",
                  borderRadius: "30px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                }}
              >
                {added ? "✓ Added to Bag" : "Add to Bag"}
              </button>
            </div>

            {added && (
              <Link
                to="/cart"
                style={{
                  color: "#c1662f",
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  borderBottom: "1px solid #c1662f",
                  alignSelf: "flex-start",
                }}
              >
                View Bag →
              </Link>
            )}

            <div
              style={{
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid #ece6dc",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {[
                "Free shipping on orders over $50",
                "30-day return policy",
                "Secure checkout via Stripe, PayPal, VNPay",
              ].map((line) => (
                <p
                  key={line}
                  style={{
                    margin: 0,
                    fontSize: "0.82rem",
                    color: "#a39c8f",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: "#c1662f" }}>✓</span> {line}
                </p>
              ))}
            </div>
            <div
              style={{
                marginTop: "50px",
                paddingTop: "30px",
                borderTop: "1px solid #ece6dc",
              }}
            >
              <h2
                style={{
                  fontFamily: "Georgia, serif",
                  fontWeight: "400",
                  color: "#2b2825",
                  fontSize: "1.5rem",
                  marginBottom: "10px",
                }}
              >
                Customer Reviews
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#c1662f",
                  }}
                >
                  {ratingSummary.average_rating.toFixed(1)}
                </span>

                <span style={{ color: "#c1662f", fontSize: "1.1rem" }}>
                  {"★".repeat(Math.round(ratingSummary.average_rating))}
                </span>

                <span
                  style={{
                    color: "#a39c8f",
                    fontSize: "0.85rem",
                  }}
                >
                  {ratingSummary.review_count} review
                  {ratingSummary.review_count !== 1 ? "s" : ""}
                </span>
              </div>

              {user && (
                <form
                  onSubmit={handleSubmitReview}
                  style={{
                    padding: "20px",
                    backgroundColor: "#fff",
                    border: "1px solid #ece6dc",
                    borderRadius: "16px",
                    marginBottom: "25px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 15px",
                      color: "#2b2825",
                      fontSize: "1rem",
                    }}
                  >
                    Write a Review
                  </h3>

                  <div style={{ marginBottom: "15px" }}>
                    <p
                      style={{
                        margin: "0 0 8px",
                        color: "#5c574d",
                        fontSize: "0.85rem",
                      }}
                    >
                      Your Rating
                    </p>

                    <div style={{ display: "flex", gap: "4px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: "1.5rem",
                            color: star <= reviewRating ? "#c1662f" : "#d8d1c6",
                            padding: "2px",
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    maxLength={1000}
                    rows={4}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      resize: "vertical",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #ece6dc",
                      fontSize: "0.85rem",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />

                  {reviewError && (
                    <p
                      style={{
                        margin: "10px 0 0",
                        color: "#c14f2f",
                        fontSize: "0.82rem",
                      }}
                    >
                      {reviewError}
                    </p>
                  )}

                  {reviewSuccess && (
                    <p
                      style={{
                        margin: "10px 0 0",
                        color: "#5a7d5a",
                        fontSize: "0.82rem",
                      }}
                    >
                      {reviewSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    style={{
                      marginTop: "14px",
                      padding: "11px 24px",
                      border: "none",
                      borderRadius: "25px",
                      backgroundColor: "#2b2825",
                      color: "#fff",
                      cursor: reviewLoading ? "not-allowed" : "pointer",
                      opacity: reviewLoading ? 0.6 : 1,
                    }}
                  >
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}

              {!user && (
                <p
                  style={{
                    padding: "16px",
                    backgroundColor: "#f5f0e9",
                    borderRadius: "12px",
                    color: "#8a8378",
                    fontSize: "0.85rem",
                  }}
                >
                  Please log in to write a review.
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {reviews.length === 0 ? (
                  <div
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "#a39c8f",
                      backgroundColor: "#fff",
                      borderRadius: "14px",
                      border: "1px solid #ece6dc",
                    }}
                  >
                    No reviews yet. Be the first to review this product.
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        padding: "18px",
                        backgroundColor: "#fff",
                        borderRadius: "14px",
                        border: "1px solid #ece6dc",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                        }}
                      >
                        <strong
                          style={{
                            color: "#2b2825",
                            fontSize: "0.9rem",
                          }}
                        >
                          {review.customer_name || "Customer"}
                        </strong>

                        <span
                          style={{
                            color: "#a39c8f",
                            fontSize: "0.75rem",
                          }}
                        >
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div
                        style={{
                          color: "#c1662f",
                          marginTop: "5px",
                        }}
                      >
                        {"★".repeat(review.rating)}
                        <span style={{ color: "#d8d1c6" }}>
                          {"★".repeat(5 - review.rating)}
                        </span>
                      </div>

                      {review.comment && (
                        <p
                          style={{
                            margin: "10px 0 0",
                            color: "#5c574d",
                            fontSize: "0.85rem",
                            lineHeight: "1.6",
                          }}
                        >
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
