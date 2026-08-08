import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { shipperApi } from "../../api/shipperApi";
import RouteProgress from "../../Components/RouteProgress";
import { formatUSD } from "../../utils/currency";

const TABS = [
  { key: "available", label: "Available" },
  { key: "mine", label: "My Shipments" },
];

const ShipmentsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("mine");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actingId, setActingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data =
        tab === "available"
          ? await shipperApi.getAvailable()
          : await shipperApi.getMyDeliveries();
      setOrders(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    setSelected(null);
  }, [tab]);

  const handleAccept = async (orderId) => {
    setActingId(orderId);
    try {
      await shipperApi.accept(orderId);
      fetchOrders();
    } finally {
      setActingId(null);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    setActingId(orderId);
    try {
      const updated = await shipperApi.updateStatus(orderId, status);
      setSelected(updated);
      fetchOrders();
    } finally {
      setActingId(null);
    }
  };

  return (
    <div style={{ padding: "28px 32px 60px" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          color: "#14162b",
          marginBottom: "20px",
        }}
      >
        Shipments
      </h1>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* List */}
        <div style={{ flex: "1 1 340px", minWidth: "300px" }}>
          <div
            style={{
              display: "flex",
              gap: "6px",
              background: "#eceef4",
              padding: "4px",
              borderRadius: "12px",
              marginBottom: "16px",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: "9px",
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  backgroundColor: tab === t.key ? "#fff" : "transparent",
                  color: tab === t.key ? "#4f46e5" : "#8b8fa3",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p
              style={{
                color: "#8b8fa3",
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              Loading...
            </p>
          ) : orders.length === 0 ? (
            <p
              style={{
                color: "#8b8fa3",
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              No shipments here.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setSelected(o)}
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    cursor: "pointer",
                    border:
                      selected?.id === o.id
                        ? "2px solid #4f46e5"
                        : "1px solid #eef0f5",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <p
                      style={{ margin: 0, fontWeight: "700", color: "#14162b" }}
                    >
                      #{o.id}
                    </p>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        padding: "2px 10px",
                        borderRadius: "20px",
                        backgroundColor: "#eef2ff",
                        color: "#4f46e5",
                      }}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "0.8rem",
                      color: "#8b8fa3",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    📍 {o.shipping_address}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div style={{ flex: "2 1 480px", minWidth: "320px" }}>
          {selected ? (
            <div
              style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "26px",
                border: "1px solid #eef0f5",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <p
                    style={{ margin: 0, fontSize: "0.78rem", color: "#a0a3b5" }}
                  >
                    Shipment
                  </p>
                  <h2
                    style={{
                      margin: "2px 0 0",
                      fontSize: "1.3rem",
                      fontWeight: "800",
                      color: "#14162b",
                    }}
                  >
                    Order #{selected.id}
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    padding: "5px 14px",
                    borderRadius: "20px",
                    backgroundColor: "#eef2ff",
                    color: "#4f46e5",
                  }}
                >
                  {selected.status}
                </span>
              </div>

              <RouteProgress status={selected.status} />

              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  flexWrap: "wrap",
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid #eef0f5",
                }}
              >
                <div>
                  <p
                    style={{ margin: 0, fontSize: "0.75rem", color: "#a0a3b5" }}
                  >
                    Delivery Address
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "0.88rem",
                      color: "#14162b",
                      fontWeight: "500",
                    }}
                  >
                    {selected.shipping_address}
                  </p>
                </div>
                <div>
                  <p
                    style={{ margin: 0, fontSize: "0.75rem", color: "#a0a3b5" }}
                  >
                    Order Value
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "0.88rem",
                      color: "#14162b",
                      fontWeight: "700",
                    }}
                  >
                    {formatUSD(selected.total_amount)}
                  </p>
                </div>
                <div>
                  <p
                    style={{ margin: 0, fontSize: "0.75rem", color: "#a0a3b5" }}
                  >
                    Provider
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "0.88rem",
                      color: "#14162b",
                      fontWeight: "500",
                    }}
                  >
                    {selected.shipping_provider}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/shipper/shipments/${selected.id}`)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: "12px",
                  border: "1px solid #4f46e5",
                  background: "#fff",
                  color: "#4f46e5",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                View Full Details
              </button>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                {tab === "available" && (
                  <button
                    onClick={() => handleAccept(selected.id)}
                    disabled={actingId === selected.id}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "#4f46e5",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Accept Delivery
                  </button>
                )}
                {tab === "mine" && selected.status === "PROCESSING" && (
                  <button
                    onClick={() => handleUpdateStatus(selected.id, "SHIPPED")}
                    disabled={actingId === selected.id}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "#7c3aed",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Start Delivery
                  </button>
                )}
                {tab === "mine" && selected.status === "SHIPPED" && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selected.id, "COMPLETED")
                      }
                      disabled={actingId === selected.id}
                      style={{
                        flex: 1,
                        padding: "12px 0",
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: "#16a34a",
                        color: "#fff",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Mark Delivered
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selected.id, "FAILED")}
                      disabled={actingId === selected.id}
                      style={{
                        flex: 1,
                        padding: "12px 0",
                        borderRadius: "12px",
                        border: "1px solid #dc2626",
                        backgroundColor: "#fff",
                        color: "#dc2626",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Mark Failed
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p
              style={{
                color: "#a0a3b5",
                textAlign: "center",
                padding: "80px 0",
              }}
            >
              Select a shipment to view details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipmentsPage;
