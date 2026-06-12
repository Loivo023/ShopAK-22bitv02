import Header from './Components/Header';
import Banner from './Components/Banner';
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
        courseName="Full-Stack Web Development"
      />
    </>
  );
};
 
export default App;

