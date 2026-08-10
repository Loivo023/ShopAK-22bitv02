import { useEffect, useState } from "react";
import { reviewApi } from "../../api/reviewApi";

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await reviewApi.getAllReviews();

      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      const detail = err?.response?.data?.detail;

      setError(typeof detail === "string" ? detail : "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(reviewId);

      await reviewApi.deleteReview(reviewId);

      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (err) {
      const detail = err?.response?.data?.detail;

      alert(
        typeof detail === "string" ? detail : "Unable to delete this review.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <span style={{ letterSpacing: "2px" }}>
        {"★".repeat(rating)}
        <span style={{ color: "#d8d3ca" }}>{"★".repeat(5 - rating)}</span>
      </span>
    );
  };

  return (
    <div
      style={{
        padding: "32px",
        minHeight: "100vh",
        background: "#f5f6fb",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          gap: "20px",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 6px",
              color: "#7c6cff",
              fontSize: "0.72rem",
              fontWeight: "700",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
            }}
          >
            Moderation
          </p>

          <h1
            style={{
              margin: 0,
              color: "#101828",
              fontSize: "1.8rem",
              fontWeight: "700",
            }}
          >
            Customer Reviews
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#667085",
              fontSize: "0.9rem",
            }}
          >
            Review and moderate customer feedback.
          </p>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          style={{
            padding: "10px 18px",
            border: "1px solid #d0d5dd",
            borderRadius: "10px",
            background: "#fff",
            color: "#344054",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
            opacity: loading ? 0.6 : 1,
          }}
        >
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eaecf0",
          borderRadius: "14px",
          padding: "20px 24px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            color: "#667085",
            fontSize: "0.8rem",
            marginBottom: "5px",
          }}
        >
          Total Reviews
        </div>

        <div
          style={{
            color: "#101828",
            fontSize: "1.7rem",
            fontWeight: "700",
          }}
        >
          {reviews.length}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#fef3f2",
            border: "1px solid #fecdca",
            color: "#b42318",
            padding: "14px 18px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "50px",
            textAlign: "center",
            color: "#667085",
          }}
        >
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eaecf0",
            borderRadius: "14px",
            padding: "60px 20px",
            textAlign: "center",
            color: "#667085",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              marginBottom: "12px",
            }}
          >
            ★
          </div>

          <div
            style={{
              fontWeight: "600",
              color: "#344054",
              marginBottom: "5px",
            }}
          >
            No reviews yet
          </div>

          <div style={{ fontSize: "0.85rem" }}>
            Customer reviews will appear here.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "#fff",
                border: "1px solid #eaecf0",
                borderRadius: "14px",
                padding: "22px",
              }}
            >
              {/* Top row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* Customer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #7c6cff, #4f46e5)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "0.8rem",
                      }}
                    >
                      {(review.customer_name || "U").slice(0, 1).toUpperCase()}
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#101828",
                          fontWeight: "600",
                          fontSize: "0.9rem",
                        }}
                      >
                        {review.customer_name || "Unknown Customer"}
                      </div>

                      <div
                        style={{
                          color: "#98a2b3",
                          fontSize: "0.75rem",
                        }}
                      >
                        Review #{review.id}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div
                    style={{
                      marginBottom: "10px",
                      color: "#f59e0b",
                      fontSize: "0.95rem",
                    }}
                  >
                    {renderStars(review.rating)}
                    <span
                      style={{
                        color: "#667085",
                        marginLeft: "10px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Comment */}
                  <div
                    style={{
                      color: "#344054",
                      fontSize: "0.9rem",
                      lineHeight: "1.6",
                    }}
                  >
                    {review.comment || (
                      <span
                        style={{
                          color: "#98a2b3",
                          fontStyle: "italic",
                        }}
                      >
                        No comment provided.
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={deletingId === review.id}
                  style={{
                    border: "1px solid #fecdca",
                    background: "#fff5f4",
                    color: "#b42318",
                    padding: "9px 14px",
                    borderRadius: "9px",
                    cursor:
                      deletingId === review.id ? "not-allowed" : "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    opacity: deletingId === review.id ? 0.6 : 1,
                  }}
                >
                  {deletingId === review.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              {/* Footer */}
              <div
                style={{
                  borderTop: "1px solid #f2f4f7",
                  marginTop: "18px",
                  paddingTop: "12px",
                  display: "flex",
                  gap: "20px",
                  color: "#98a2b3",
                  fontSize: "0.75rem",
                }}
              >
                <span>Product ID: {review.product_id}</span>

                <span>
                  Created:{" "}
                  {review.created_at
                    ? new Date(review.created_at).toLocaleString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
