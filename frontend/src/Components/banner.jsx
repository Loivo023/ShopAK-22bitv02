const Banner = ({ subtitle, buttonText }) => {
  return (
    <section style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
      <h2>{subtitle}</h2>
      <p>Discover our latest products and special offers.</p>
      <button>{buttonText}</button>
    </section>
  );
};

export default Banner;
