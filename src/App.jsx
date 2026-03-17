import { Routes, Route } from "react-router-dom"
import Tables from "./pages/Tables"
import Order from "./pages/Order"
import Payment from "./pages/Payment"


function App() {
  return (
   <Routes>
    <Route path="/" element={<Tables />} /> 
   <Route path="/tables" element={<Tables />} />
     <Route path="/order/:tableId" element={<Order />} />
     <Route path="/payment/:orderId" element={<Payment />} />
   </Routes>
  )
}

export default App