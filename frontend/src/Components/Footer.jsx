const Footer = ({ studentName, courseName }) => (
  <footer style={{
    padding: '24px',
    borderTop: '1px solid #ddd',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    color: '#777',
    fontSize: '0.9rem',
  }}>
    <p style={{ margin: 0 }}>ShopAK — {courseName}</p>
    <p style={{ margin: '4px 0 0' }}>Built by {studentName}</p>
  </footer>
);

export default Footer;