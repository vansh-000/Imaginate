import React from "react";
import Home from "./pages/Home";
import Results from "./pages/Results";
import BuyCredits from "./pages/BuyCredits";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="px-4 sm:px-10 md:px-14 lg:px-28 min-h-screen bg-gradient-to-b from-teal-50 to-orange-50">
      <Navbar/>
      <main>
      <Outlet />
      </main>
      <Footer/>
    </div>
  );
};

export default App;
