import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Exportamos con AMBOS nombres para que cualquier archivo lo encuentre
export const generateTicket = (orderData) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("PUB POS - Comprobante", 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Orden #: ${orderData.orderId || orderData.order_id}`, 14, 30);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 36);

  // Usamos el plugin directamente para evitar el error de "not a function"
  autoTable(doc, {
    startY: 45,
    head: [['Cant', 'Producto', 'Precio', 'Subtotal']],
    body: orderData.items.map(i => [
      i.quantity, 
      i.name, 
      `$${Number(i.price).toLocaleString('es-CL')}`, 
      `$${(i.quantity * i.price).toLocaleString('es-CL')}`
    ]),
    headStyles: { fillColor: [46, 204, 113] }
  });

  const totalFinal = orderData.total || orderData.items.reduce((acc, i) => acc + (i.quantity * i.price), 0);
  doc.text(`TOTAL: $${totalFinal.toLocaleString('es-CL')}`, 14, doc.lastAutoTable.finalY + 10);

  doc.save(`Ticket_${orderData.orderId || orderData.order_id}.pdf`);
};

// Esto soluciona el problema de los nombres cruzados
export const generarPDF = generateTicket;