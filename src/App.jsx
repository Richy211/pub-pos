import { Routes, Route } from "react-router-dom"
import Tables from "./pages/Tables"
import Order from "./pages/Order"


function App() {
  return (
   <Routes>
     <Route path="/" element={<Tables />} />
     <Route path="/order/:tableId" element={<Order />} />
   </Routes>
  )
}

export default App