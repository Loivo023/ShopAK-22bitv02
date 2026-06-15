import Header from './Components/Header';
import Banner from './Components/Banner';
<<<<<<< Updated upstream
import FeatureSection from './Components/FeatureSection';
import Footer from './Components/Footer';

const App = () => {
  return (
    <>
      <Header title="ShopAK" />
      <Banner subtitle="Welcome to our store" buttonText="Shop Now" />
      <FeatureSection />
      <Footer
        studentName="Le Nguyen Hoang Long & Vo Thanh Loi"
=======
import Footer from './Components/Footer';
import { ProductList } from './Components/ProductList';
import { UserList } from './Components/UserList';

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
>>>>>>> Stashed changes
        courseName="Full-Stack Web Development"
      />
    </>
  );
};
<<<<<<< Updated upstream
 
export default App;

=======

export default App;
>>>>>>> Stashed changes
