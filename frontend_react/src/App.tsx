import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/home/home";
import ProductDetail from "./pages/product-detail/product-detail";
import Products from "./pages/products/products";
import Cart from "./pages/cart/cart";
import Payment from "./pages/payment/payment";
import CancelPage from "./pages/orders/cancel";
import SuccessPage from "./pages/orders/success";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import NotFound from "./pages/404/404";
import AdminLayout from "./admin/layout/adminLayout";
import RequireAdmin from "./admin/layout/requireAdmin";
import AdminProduct from "./admin/product/product";
import AdminCategory from "./admin/category/category";
import AdminBrand from "./admin/brand/brand";
import AdminTag from "./admin/tag/tag";
import AdminService from "./admin/service/service";

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
    path: "/payment",
    element: <Payment />,
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
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/products" replace /> },
      { path: "products", element: <AdminProduct /> },
      { path: "categories", element: <AdminCategory /> },
      { path: "brands", element: <AdminBrand /> },
      { path: "tags", element: <AdminTag /> },
      { path: "services", element: <AdminService /> },
    ],
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