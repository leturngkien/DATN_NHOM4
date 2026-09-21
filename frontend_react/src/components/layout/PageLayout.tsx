import { Outlet } from "react-router-dom";
import Footer from "../footer.tsx";
import ShopHeader from "./ShopHeader";

function PageLayout() {
  return (
    <>
      <ShopHeader />
      <Outlet />
      <Footer />
    </>
  );
}

export default PageLayout;
