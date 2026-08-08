import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { shipperApi } from "../../api/shipperApi";
import { formatUSD } from "../../utils/currency";

const ShipmentDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  const [proofUploading, setProofUploading] = useState(false);

  const [showFailureModal, setShowFailureModal] = useState(false);

  const [failureReason, setFailureReason] = useState("");

  const [failureSubmitting, setFailureSubmitting] = useState(false);

  // =========================
  // CUSTOMER
  // =========================

  const callCustomer = () => {
    if (!order?.customer_phone) {
      alert("Customer phone number is not available.");
      return;
    }

    window.location.href = `tel:${order.customer_phone}`;
  };

  // =========================
  // LOAD ORDER
  // =========================

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await shipperApi.getDelivery(orderId);

      setOrder(data);
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.detail || "Failed to load shipment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (status) => {
    if (!order) return;

    try {
      setActing(true);

      const updated = await shipperApi.updateStatus(order.id, status);

      setOrder(updated);
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.detail || "Failed to update shipment.");
    } finally {
      setActing(false);
    }
  };

  // =========================
  // FAILURE
  // =========================

  const submitFailure = async () => {
    if (!failureReason.trim()) {
      alert("Please select or enter a failure reason.");
      return;
    }

    try {
      setFailureSubmitting(true);

      const updated = await shipperApi.failDelivery(order.id, failureReason);

      setOrder(updated);

      setShowFailureModal(false);
      setFailureReason("");
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.detail || "Failed to update delivery.");
    } finally {
      setFailureSubmitting(false);
    }
  };

  // =========================
  // NAVIGATION
  // =========================

  const openNavigation = () => {
    if (!order?.shipping_address) return;

    const address = encodeURIComponent(order.shipping_address);

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${address}`,
      "_blank",
    );
  };

  // =========================
  // PROOF OF DELIVERY
  // =========================

  const uploadProof = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setProofUploading(true);

      const updated = await shipperApi.uploadProof(order.id, file);

      setOrder(updated);

      alert("Delivery proof uploaded successfully.");
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.detail || "Failed to upload proof.");
    } finally {
      setProofUploading(false);
      event.target.value = "";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return <div style={{ padding: 32 }}>Loading shipment...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 32 }}>
        <h2>Unable to load shipment</h2>

        <p>{error}</p>

        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!order) {
    return <div style={{ padding: 32 }}>Shipment not found.</div>;
  }

  return (
    <div
      style={{
        padding: "28px 32px 60px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Link
            to="/shipper/shipments"
            style={{
              textDecoration: "none",
              color: "#4f46e5",
              fontSize: 13,
            }}
          >
            ← Back to Shipments
          </Link>

          <h1
            style={{
              margin: "10px 0 4px",
              color: "#14162b",
            }}
          >
            Order #{order.id}
          </h1>

          <p
            style={{
              margin: 0,
              color: "#8b8fa3",
            }}
          >
            Shipment details
          </p>
        </div>

        <StatusBadge status={order.status} />
      </div>

      {/* CUSTOMER */}

      <section style={cardStyle}>
        <h2 style={sectionTitle}>Customer</h2>

        <div style={gridStyle}>
          <Info label="Name" value={order.customer_name || "Not available"} />

          <Info label="Phone" value={order.customer_phone || "Not available"} />

          <Info label="Email" value={order.customer_email || "Not available"} />
          <button
            onClick={callCustomer}
            disabled={!order.customer_phone}
            style={{
              border: "none",
              background: "#4f46e5",
              color: "#fff",
              padding: "11px 18px",
              borderRadius: 10,
              cursor: order.customer_phone ? "pointer" : "not-allowed",
              fontWeight: 700,
              opacity: order.customer_phone ? 1 : 0.5,
            }}
          >
            📞 Call Customer
          </button>
        </div>
      </section>

      {/* DELIVERY */}

      <section style={cardStyle}>
        <h2 style={sectionTitle}>Delivery Information</h2>

        <div style={gridStyle}>
          <Info
            label="Delivery Address"
            value={order.shipping_address || "No address"}
          />

          <Info
            label="Shipping Provider"
            value={order.shipping_provider || "-"}
          />

          <Info
            label="Shipping Fee"
            value={formatUSD(order.shipping_fee || 0)}
          />

          <Info
            label="Tracking Number"
            value={
              order.tracking_number || order.tracking_code || "Not assigned"
            }
          />
        </div>

        <button
          onClick={openNavigation}
          disabled={!order.shipping_address}
          style={primaryButton}
        >
          🗺️ Open Navigation
        </button>
      </section>

      {/* PAYMENT */}

      <section style={cardStyle}>
        <h2 style={sectionTitle}>Payment</h2>

        <div style={gridStyle}>
          <Info label="Order Value" value={formatUSD(order.total_amount)} />

          <Info
            label="Payment Status"
            value={order.payment_status || "UNKNOWN"}
          />
        </div>
      </section>

      {/* PRODUCTS */}

      <section style={cardStyle}>
        <h2 style={sectionTitle}>Products</h2>

        <div>
          {order.items?.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid #eef0f5",
              }}
            >
              <div>
                <strong>{item.product_name}</strong>

                <div
                  style={{
                    marginTop: 4,
                    color: "#8b8fa3",
                    fontSize: 13,
                  }}
                >
                  Quantity: {item.quantity}
                </div>
              </div>

              <strong>{formatUSD(item.line_total)}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIONS */}

      <section style={cardStyle}>
        <h2 style={sectionTitle}>Delivery Actions</h2>

        {(order.status === "SHIPPED" || order.status === "COMPLETED") && (
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 18px",
              borderRadius: 10,
              background: "#111827",
              color: "#fff",
              fontWeight: 700,
              cursor: proofUploading ? "not-allowed" : "pointer",
              opacity: proofUploading ? 0.6 : 1,
            }}
          >
            📷{" "}
            {proofUploading
              ? "Uploading..."
              : order.delivery_proof_url
                ? "Replace Proof"
                : "Upload Proof"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={uploadProof}
              disabled={proofUploading}
              style={{ display: "none" }}
            />
          </label>
        )}

        {order.delivery_proof_url && (
          <section style={cardStyle}>
            <h2 style={sectionTitle}>Delivery Proof</h2>

            <img
              src={
                order.delivery_proof_url.startsWith("http")
                  ? order.delivery_proof_url
                  : `${import.meta.env.VITE_API_URL}${order.delivery_proof_url}`
              }
              alt={`Delivery proof for Order #${order.id}`}
              style={{
                width: "100%",
                maxWidth: 500,
                maxHeight: 500,
                objectFit: "contain",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            />

            {order.delivered_at && (
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  marginTop: 10,
                }}
              >
                Delivered at: {order.delivered_at}
              </p>
            )}
          </section>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {order.status === "PROCESSING" && (
            <button
              disabled={acting}
              onClick={() => updateStatus("SHIPPED")}
              style={primaryButton}
            >
              🚚 Start Delivery
            </button>
          )}

          {order.status === "SHIPPED" && (
            <>
              <button
                disabled={acting}
                onClick={() => updateStatus("COMPLETED")}
                style={successButton}
              >
                ✓ Mark Delivered
              </button>

              <button
                disabled={acting}
                onClick={() => setShowFailureModal(true)}
                style={dangerButton}
              >
                ✕ Delivery Failed
              </button>
            </>
          )}

          {order.status === "COMPLETED" && (
            <div style={successMessage}>
              ✓ This shipment has been delivered.
            </div>
          )}

          {order.status === "FAILED" && (
            <div style={failedMessage}>This delivery was marked as failed.</div>
          )}
        </div>
      </section>
      {showFailureModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#14162b",
              }}
            >
              Delivery Failed
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginBottom: 20,
              }}
            >
              Please provide a reason for the failed delivery.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                "Customer unavailable",
                "Wrong address",
                "Customer refused",
                "Unable to contact customer",
                "Package damaged",
              ].map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 10,
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="failureReason"
                    value={reason}
                    checked={failureReason === reason}
                    onChange={(e) => setFailureReason(e.target.value)}
                  />

                  {reason}
                </label>
              ))}
            </div>

            <textarea
              placeholder="Other reason..."
              value={
                [
                  "Customer unavailable",
                  "Wrong address",
                  "Customer refused",
                  "Unable to contact customer",
                  "Package damaged",
                ].includes(failureReason)
                  ? ""
                  : failureReason
              }
              onChange={(e) => setFailureReason(e.target.value)}
              style={{
                width: "100%",
                minHeight: 90,
                marginTop: 15,
                padding: 12,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                onClick={() => {
                  setShowFailureModal(false);
                  setFailureReason("");
                }}
                disabled={failureSubmitting}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={submitFailure}
                disabled={failureSubmitting || !failureReason.trim()}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: failureSubmitting || !failureReason.trim() ? 0.5 : 1,
                }}
              >
                {failureSubmitting ? "Saving..." : "Confirm Failed Delivery"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================
   COMPONENTS
========================= */

const Info = ({ label, value }) => (
  <div>
    <div
      style={{
        fontSize: 12,
        color: "#8b8fa3",
        marginBottom: 5,
      }}
    >
      {label}
    </div>

    <div
      style={{
        fontWeight: 700,
        color: "#14162b",
      }}
    >
      {value}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    PROCESSING: "#f59e0b",
    SHIPPED: "#2563eb",
    COMPLETED: "#16a34a",
    FAILED: "#dc2626",
  };

  return (
    <span
      style={{
        padding: "7px 14px",
        borderRadius: 20,
        background: (colors[status] || "#6b7280") + "22",
        color: colors[status] || "#6b7280",
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {status}
    </span>
  );
};

/* =========================
   STYLES
========================= */

const cardStyle = {
  background: "#fff",
  border: "1px solid #eef0f5",
  borderRadius: 16,
  padding: 24,
  marginBottom: 18,
};

const sectionTitle = {
  margin: "0 0 20px",
  color: "#14162b",
  fontSize: 18,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
  marginBottom: 20,
};

const primaryButton = {
  border: "none",
  background: "#4f46e5",
  color: "#fff",
  padding: "11px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};

const successButton = {
  ...primaryButton,
  background: "#16a34a",
};

const dangerButton = {
  ...primaryButton,
  background: "#dc2626",
};

const successMessage = {
  color: "#15803d",
  fontWeight: 700,
};

const failedMessage = {
  color: "#b91c1c",
  fontWeight: 700,
};

export default ShipmentDetailPage;
