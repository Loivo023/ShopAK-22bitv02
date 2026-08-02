const Footer = ({ studentName, courseName }) => {
  return (
    <footer
      style={{
        backgroundColor: "#f0e4d8",
        padding: "40px 24px 32px",
        textAlign: "center",
        borderTop: "1px solid #ece6dc",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontFamily: "Georgia, serif",
          fontSize: "1.1rem",
          color: "#2b2825",
        }}
      >
        ShopAK
      </p>
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#8a8378" }}>
        {courseName}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#a39c8f" }}>
        Built by {studentName}
      </p>
    </footer>
  );
};

export default Footer;
