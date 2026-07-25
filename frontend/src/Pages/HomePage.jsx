import Banner from '../Components/Banner';

const HomePage = () => (
  <>
    <Banner
      title="Welcome to ShopAK"
      subtitle="Discover amazing products at unbeatable prices."
      buttonText="Shop Now"
    />
    <section style={{ padding: '48px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#111', marginBottom: '16px' }}>About ShopAK</h2>
      <p style={{ color: '#666', lineHeight: '1.8', fontSize: '1.05rem' }}>
        ShopAK is your one-stop online store for electronics, fashion, accessories, and more.
        Browse our curated catalog, filter by category, and find exactly what you need —
        all in one place.
      </p>

      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '40px', flexWrap: 'wrap' }}>
        {[
          { icon: '🛍️', label: 'Wide Selection', desc: 'Hundreds of products across categories' },
          { icon: '💰', label: 'Best Prices',    desc: 'Competitive pricing on every item' },
          { icon: '🚀', label: 'Fast Delivery',  desc: 'Quick and reliable shipping' },
        ].map((f) => (
          <div key={f.label} style={{
            flex: '1', minWidth: '180px', padding: '24px',
            border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fafafa',
          }}>
            <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>{f.icon}</p>
            <p style={{ fontWeight: 'bold', color: '#111', margin: '0 0 6px' }}>{f.label}</p>
            <p style={{ color: '#777', fontSize: '0.88rem', margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  </>
);

export default HomePage;