const Footer = ({ studentName, courseName }) => {
  const year = new Date().getFullYear();
 
  return (
    <footer style={{ padding: '16px 24px', borderTop: '1px solid #ddd' }}>
      <p>© {year} ShopAK</p>
      <p>Student: {studentName}</p>
      <p>Course: {courseName}</p>
    </footer>
  );
};
 
export default Footer;

