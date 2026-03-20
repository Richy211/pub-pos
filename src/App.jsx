import { Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar"  
import Topbar from "./components/Topbar"

import Tables from "./pages/Tables"
import Order from "./pages/Order"
import Payment from "./pages/Payment"

import CashClose from "./pages/CashClose"


function App() {
  return (
  
      <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <Sidebar />

     <div className="flex-1 p-6"> 
      <div className="bg-slate-900 rounded-2x1 p-6 shadow-lg min-h-full ">
          <Routes>
            <Route path="/" element={<Tables />} /> 
          <Route path="/tables" element={<Tables />} />
            <Route path="/order/:tableId" element={<Order />} />
            <Route path="/payment/:orderId" element={<Payment />} />
            <Route path="/cash-close" element={<CashClose />} />
          </Routes>
      </div>
      </div>
   </div>
  )
}

export default App