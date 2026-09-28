import {
  createBrowserRouter,
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
import PostPage from "./pages/post/post";
import PostDetailPage from "./pages/post/post-detail";
import ContactPage from "./pages/contact/contact";
import AboutUsPage from "./pages/about/about-us";
import ServicesPage from "./pages/services/services";
import AdminLayout from "./admin/layout/adminLayout";
import RequireAdmin from "./admin/layout/requireAdmin";
import AdminDashboard from "./admin/dashboard/dashboard";
import AdminUser from "./admin/user/user";
import AdminProduct from "./admin/product/product";
import AdminOrder from "./admin/order/order";
import AdminCategory from "./admin/category/category";
import AdminBrand from "./admin/brand/brand";
import AdminTag from "./admin/tag/tag";
import AdminPost from "./admin/post/post";
import AdminContact from "./admin/contact/contact";
import PageLayout from "./components/layout/PageLayout";
import Account from "./components/account";
import MyOrders from "./pages/orders/my-orders";

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
    element: <PageLayout />,
    children: [
      {
        path: "/cart",
        element: <Cart />,
      },
    ],
  },
  {
    path: "/userprofile",
    element: <PageLayout />,
    children: [
      { index: true, element: <Account /> },
      { path: "account", element: <Account /> },
      { path: "orders", element: <MyOrders /> },
      { path: "*", element: <Account /> },
    ],
  },
  {
    path: "/payment",
    element: <Payment />,
  },
  {
    path: "/checkout",
    element: <Payment />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/blogs",
    element: <PostPage />,
  },
  {
    path: "/blogs/:id",
    element: <PostDetailPage />,
  },
  {
    path: "/about-us",
    element: <AboutUsPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/services",
    element: <PageLayout />,
    children: [
      { index: true, element: <ServicesPage /> },
    ],
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
      { index: true, element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "orders", element: <AdminOrder /> },
      { path: "users", element: <AdminUser /> },
      { path: "products", element: <AdminProduct /> },
      { path: "categories", element: <AdminCategory /> },
      { path: "brands", element: <AdminBrand /> },
      { path: "tags", element: <AdminTag /> },
      { path: "blogs", element: <AdminPost /> },
      { path: "contacts", element: <AdminContact /> },
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