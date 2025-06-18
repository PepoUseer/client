import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./layout";
import Dashboard from "./reservation/dashboard";
import CustomerList from "./customer/customer-list";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/customerList" element={<CustomerList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
