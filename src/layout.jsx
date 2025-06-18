import Container from "react-bootstrap/Container";

import { Outlet } from "react-router-dom";
import NavBar from "./navbar";

function Layout() {
  return (
    <>
      <NavBar />
      <Container fluid className="p-0">
        <Outlet />
      </Container>
    </>
  );
}

export default Layout;