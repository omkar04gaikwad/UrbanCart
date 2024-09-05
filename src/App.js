import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Items } from './Components/Items/Items';
import ProtectedRoute from './Components/ProtectedRouter/ProtectedRouter';
import { SignUp } from './Components/SignUp/SignUp';
import { Login } from './Components/Login/Login';
import { Cart } from './Components/Items/Cart/Cart';
import { Orders } from './Components/Items/Orders/Orders';
import React, { useState, useEffect } from 'react';
function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  },[]);
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  return (
    <Router>
      <div className="App">
        <Routes>
        <Route  path ='/' element={<Login  cart={cart} setCart={setCart}/>}/>
        <Route path='/signup' element ={<SignUp />}/>
            <Route element={<ProtectedRoute />}>
              <Route path='/items/*' element={<Items cart={cart} setCart={setCart} />}>
                <Route path='cart' element={<Cart cart={cart} setCart={setCart} />} />
                <Route path='orders' element={<Orders />} />
              </Route>
            </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
