import { useEffect, useState } from "react";
import { profileApi } from "../api/extrasApi";
import { setUser as saveUserLocal } from "../auth/token";

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #ece6dc",
  fontSize: "0.85rem",
  boxSizing: "border-box",
  width: "100%",
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
  });
  const [addrForm, setAddrForm] = useState({
    label: "Home",
    full_address: "",
    phone: "",
    is_default: false,
  });

  const fetchAll = async () => {
    setLoading(true);
    const [me, addr] = await Promise.all([
      profileApi.getMe(),
      profileApi.getAddresses(),
    ]);
    setProfile(me);
    setAddresses(addr);
    setForm({
      full_name: me.full_name || "",
      phone: me.phone || "",
      avatar_url: me.avatar_url || "",
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await profileApi.update(form);
      setProfile(updated);
      saveUserLocal(updated);
      setMessage("Profile updated!");
    } catch (err) {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await profileApi.changePassword(pwForm);
      setPwForm({ current_password: "", new_password: "" });
      setMessage("Password changed successfully!");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setMessage(
        typeof detail === "string" ? detail : "Failed to change password.",
      );
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await profileApi.addAddress(addrForm);
      setAddrForm({
        label: "Home",
        full_address: "",
        phone: "",
        is_default: false,
      });
      fetchAll();
    } catch (err) {
      setMessage("Failed to add address.");
    }
  };

  const handleRemoveAddress = async (id) => {
    await profileApi.removeAddress(id);
    fetchAll();
  };

  if (loading)
    return (
      <p
        style={{
          padding: "100px 24px",
          textAlign: "center",
          color: "#a39c8f",
          backgroundColor: "#faf7f2",
        }}
      >
        Loading...
      </p>
    );

  return (
    <div style={{ backgroundColor: "#faf7f2", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "48px 32px 90px",
        }}
      >
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "2rem",
            fontWeight: "400",
            color: "#2b2825",
            marginBottom: "28px",
          }}
        >
          My Profile
        </h1>

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              backgroundColor: "#eef3ea",
              borderRadius: "14px",
              color: "#5a7d5a",
              fontSize: "0.85rem",
            }}
          >
            {message}
          </div>
        )}

        {/* Profile info */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            border: "1px solid #ece6dc",
            marginBottom: "20px",
          }}
        >
          <p
            style={{ margin: "0 0 16px", fontWeight: "600", color: "#2b2825" }}
          >
            Account Information
          </p>
          <form
            onSubmit={handleSaveProfile}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "0.78rem",
                  color: "#a39c8f",
                }}
              >
                Full Name
              </label>
              <input
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "0.78rem",
                  color: "#a39c8f",
                }}
              >
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "0.78rem",
                  color: "#a39c8f",
                }}
              >
                Avatar URL
              </label>
              <input
                value={form.avatar_url}
                onChange={(e) =>
                  setForm({ ...form, avatar_url: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#a39c8f" }}>
              Email: {profile.email}
            </p>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "11px",
                borderRadius: "30px",
                border: "none",
                backgroundColor: "#2b2825",
                color: "#faf7f2",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.85rem",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            border: "1px solid #ece6dc",
            marginBottom: "20px",
          }}
        >
          <p
            style={{ margin: "0 0 16px", fontWeight: "600", color: "#2b2825" }}
          >
            Change Password
          </p>
          <form
            onSubmit={handleChangePassword}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <input
              type="password"
              placeholder="Current password"
              value={pwForm.current_password}
              onChange={(e) =>
                setPwForm({ ...pwForm, current_password: e.target.value })
              }
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={pwForm.new_password}
              onChange={(e) =>
                setPwForm({ ...pwForm, new_password: e.target.value })
              }
              required
              minLength={6}
              style={inputStyle}
            />
            <button
              type="submit"
              style={{
                padding: "11px",
                borderRadius: "30px",
                border: "1px solid #2b2825",
                backgroundColor: "#fff",
                color: "#2b2825",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.85rem",
              }}
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Addresses */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            border: "1px solid #ece6dc",
          }}
        >
          <p
            style={{ margin: "0 0 16px", fontWeight: "600", color: "#2b2825" }}
          >
            Delivery Addresses
          </p>

          {addresses.map((a) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "12px 0",
                borderBottom: "1px solid #f0e4d8",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: "#2b2825",
                    fontSize: "0.86rem",
                  }}
                >
                  {a.label}{" "}
                  {a.is_default && (
                    <span style={{ fontSize: "0.7rem", color: "#c1662f" }}>
                      (Default)
                    </span>
                  )}
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.82rem",
                    color: "#8a8378",
                  }}
                >
                  {a.full_address}
                </p>
                {a.phone && (
                  <p
                    style={{ margin: 0, fontSize: "0.78rem", color: "#a39c8f" }}
                  >
                    {a.phone}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveAddress(a.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: "1px solid #f0d4cb",
                  backgroundColor: "transparent",
                  color: "#c14f2f",
                  cursor: "pointer",
                  fontSize: "0.76rem",
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <form
            onSubmit={handleAddAddress}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                placeholder="Label (Home, Work...)"
                value={addrForm.label}
                onChange={(e) =>
                  setAddrForm({ ...addrForm, label: e.target.value })
                }
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                placeholder="Phone"
                value={addrForm.phone}
                onChange={(e) =>
                  setAddrForm({ ...addrForm, phone: e.target.value })
                }
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            <input
              placeholder="Full address"
              value={addrForm.full_address}
              onChange={(e) =>
                setAddrForm({ ...addrForm, full_address: e.target.value })
              }
              required
              style={inputStyle}
            />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.82rem",
                color: "#5c574d",
              }}
            >
              <input
                type="checkbox"
                checked={addrForm.is_default}
                onChange={(e) =>
                  setAddrForm({ ...addrForm, is_default: e.target.checked })
                }
              />
              Set as default
            </label>
            <button
              type="submit"
              style={{
                padding: "10px",
                borderRadius: "30px",
                border: "1px solid #2b2825",
                backgroundColor: "#fff",
                color: "#2b2825",
                cursor: "pointer",
                fontSize: "0.84rem",
              }}
            >
              + Add Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
