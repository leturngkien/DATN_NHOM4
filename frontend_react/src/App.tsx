import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/home/home";
import ProductDetail from "./pages/product-detail/product-detail";
import Products from "./pages/products/products";
import Cart from "./pages/cart/cart";
import CancelPage from "./pages/orders/cancel";
import SuccessPage from "./pages/orders/success";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import NotFound from "./pages/404/404";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/cart",
    element: <Cart />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/detail/:id",
    element: <ProductDetail />,
  },
  {
    path: "/orders/cancel",
    element: <CancelPage />,
  },
  {
    path: "/orders/success",
    element: <SuccessPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;