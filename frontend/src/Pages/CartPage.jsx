import { Link } from 'react-router-dom';

const CartPage = ({ cartItems, updateQty, removeItem }) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section style={{ padding: '24px 16px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#111', marginBottom: '24px' }}>
        Shopping Cart
        {cartItems.length > 0 && (
          <span style={{ fontSize: '1rem', color: '#888', fontWeight: 'normal', marginLeft: '10px' }}>
            ({totalCount} items)
          </span>
        )}
      </h2>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: '3rem' }}>🛒</p>
          <p style={{ color: '#888', marginBottom: '20px' }}>Your cart is empty.</p>
          <Link to="/products" style={{
            padding: '10px 24px', backgroundColor: '#1976d2',
            color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: '600',
          }}>
            Shop Now
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{
                display: 'flex', gap: '16px', alignItems: 'center',
                padding: '16px', border: '1px solid #eee', borderRadius: '10px',
                backgroundColor: '#fff', flexWrap: 'wrap',
              }}>
                <img
                  src={item.image} alt={item.name}
                  style={{ width: '70px', height: '70px', objectFit: 'contain', backgroundColor: '#f9f9f9', borderRadius: '6px' }}
                />
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#111', fontSize: '0.92rem' }}>
                    {item.name}
                  </p>
                  <p style={{ margin: 0, color: '#1976d2', fontWeight: 'bold' }}>
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Qty controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => updateQty(item.id, -1)} style={qtyBtn}>−</button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '600' }}>
                    {item.quantity}
                  </span>
                  <button onClick={() => updateQty(item.id, +1)} style={qtyBtn}>+</button>
                </div>

                <p style={{ minWidth: '70px', textAlign: 'right', fontWeight: 'bold', color: '#333', margin: 0 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{ background: 'none', border: 'none', color: '#e53935', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div style={{
            marginTop: '24px', padding: '20px',
            border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fafafa',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#666' }}>Subtotal ({totalCount} items)</span>
              <span style={{ fontWeight: '600', color: '#333' }}>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#666' }}>Shipping</span>
              <span style={{ color: '#4caf50', fontWeight: '600' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.1rem' }}>
              <span style={{ fontWeight: 'bold', color: '#111' }}>Total</span>
              <span style={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1.3rem' }}>${total.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button style={{
                flex: 1, padding: '12px', backgroundColor: '#1976d2',
                color: '#fff', border: 'none', borderRadius: '6px',
                cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
              }}>
                Checkout
              </button>
              <Link to="/products" style={{
                flex: 1, padding: '12px', border: '1px solid #1976d2',
                color: '#1976d2', borderRadius: '6px', textDecoration: 'none',
                textAlign: 'center', fontWeight: '600', fontSize: '1rem',
              }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

const qtyBtn = {
  width: '32px', height: '32px', border: '1px solid #ddd',
  borderRadius: '6px', backgroundColor: '#fff',
  cursor: 'pointer', fontSize: '1rem', color: '#333',
};

export default CartPage;