import Header from './Components/Header';
import Banner from './Components/Banner';
import FeatureSection from './Components/FeatureSection';
import Footer from './Components/Footer';
import {ProductList}from './Components/ProductList';

const App = () => {
  const studentName = 'Võ Thành Lợi & Lê Nguyễn Hoàng Long';

  return (
    <>
      <Header title="ShopAK" />
      <Banner
        subtitle="Welcome to our store"
        buttonText="Shop Now"
      />
      <ProductList />
      <Footer
        studentName={studentName}

        courseName="Full-Stack Web Development"
      />
    </>
  );
};

export default App;


