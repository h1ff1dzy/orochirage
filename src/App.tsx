import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {NavigationPanel} from "./components/NavigationPanel";
import {ProductPage} from "./components/Product Page/ProductPage"
import {MainPage} from "./components/Main Page/MainPage"
import CartPage from "./components/Cart Page/CartPage"
import UserPanelPage from "./components/User Panel Page/User Panel Page";
import './App.css';
import {CartProvider} from "./context/CartProvider";
import {FavoriteProvider} from "./context/FavoritesProvider";
import FavoritesPage from "./components/Favorites Page/FavoritesPage";
import {Provider} from "react-redux";
import {Slide, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import store from "./store/store";
import AdminPanelPage from "./components/Admin Panel/AdminPanelPage";
import AdminUsersList from './components/Admin Panel/AdminUsersList';
import AdminUserOrder from "./components/Admin Panel/Orders/AdminUserOrder";
import AdminOrders from "./components/Admin Panel/Orders/AdminOrders";
import ProductCollections from "./components/Collection/ProductCollections";
import ProductCategories from "./components/Categories/ProductCategories";
import AdminProductsList from "./components/Admin Panel/Products/AdminProductsList";
import AdminCollectionsList from "./components/Admin Panel/Collections/AdminCollectionsList";
import AdminCategories from "./components/Admin Panel/Categories/AdminCategories";
import AdminEditCategory from "./components/Admin Panel/Categories/AdminEditCategory";
import AdminCreateCategory from "./components/Admin Panel/Categories/AdminCreateCategory";
import PaymentStatus from "./components/Admin Panel/Payment/PaymentStatus";
import Policy from "./components/User Panel Page/Policy";
import OrderInfoPage from './components/User Orders/OrderInfoPage';
import PromoCreate from "./components/Admin Panel/Promo/PromoCreate";

const App: React.FC = () => {
    return (
        <>
            <Provider store={store}>
                <FavoriteProvider>
                    <CartProvider>
                        <Router basename="/">
                            <NavigationPanel/>
                            <ToastContainer
                                position="top-right"
                                autoClose={5000}
                                hideProgressBar
                                newestOnTop
                                closeOnClick={false}
                                rtl={false}
                                pauseOnFocusLoss={false}
                                draggable
                                pauseOnHover
                                theme="light"
                                transition={Slide}
                            />
                            <Routes>
                                <Route path="/product/:id" element={<ProductPage />} />
                                <Route path="/payment/:id" element={<PaymentStatus />} />
                                <Route path="/cart" element={<CartPage />} />
                                <Route path="/user" element={<UserPanelPage />} />
                                <Route path="/user/order/:id" element={<OrderInfoPage />} />
                                <Route path="/user/policy" element={<Policy />} />
                                <Route path="/category/" element={<ProductCategories/>} />
                                <Route path="/category/:category" element={<ProductCategories/>} />
                                <Route path="/category/:category/:subcategory" element={<ProductCategories />} /> //todo
                                <Route path="/collection/:collection" element={<ProductCollections />} />
                                <Route path="/collection" element={<ProductCollections />} />
                                <Route path="/favorites" element={<FavoritesPage />} />
                                <Route path="/user/admin" element={<AdminPanelPage/>} />
                                <Route path="/user/admin/users" element={<AdminUsersList/>} />
                                <Route path="/user/admin/users/:id/orders" element={<AdminUserOrder/>} />
                                <Route path="/user/admin/items/" element={<AdminProductsList/>} />
                                <Route path="/user/admin/items/:id" element={<AdminProductsList/>} />
                                <Route path="/user/admin/collections" element={<AdminCollectionsList/>} />
                                <Route path="/user/admin/categories" element={<AdminCategories/>} />
                                <Route path="/user/admin/categories/:url" element={<AdminEditCategory/>} />
                                <Route path="/user/admin/categories/new" element={<AdminCreateCategory/>} />
                                <Route path="/user/admin/orders" element={<AdminOrders/>} />
                                <Route path="/user/admin/promos" element={<PromoCreate/>} />
                                <Route path="/" element={<MainPage />} />
                            </Routes>
                        </Router>
                    </CartProvider>
                </FavoriteProvider>
            </Provider>
        </>


    );
}

export default App;
