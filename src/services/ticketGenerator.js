import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // <--- Importación explícita

export const generateTicket = (data) => {
  try {
    const doc = new jsPDF({
      unit: "mm",
      format: [80, 150], 
    });

    // ... (encabezado igual) ...

    // --- TABLA DE CONSUMO ---
    const tableRows = (data.items || []).map(item => [
      item.name || "Producto",
      item.quantity || 1,
      `$${((item.quantity || 1) * (item.price || 0)).toLocaleString()}`
    ]);

    // 🔥 CAMBIO AQUÍ: Usamos autoTable(doc, { ... }) en lugar de doc.autoTable
    autoTable(doc, {
      startY: 34,
      head: [['Item', 'Cant', 'Total']],
      body: tableRows,
      theme: 'plain',
      styles: { fontSize: 6, cellPadding: 0.5 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' }
      },
      headStyles: { fontStyle: 'bold' },
      margin: { left: 2, right: 2 },
    });

    // --- TOTAL ---
    // 🔥 CAMBIO AQUÍ: Usamos doc.lastAutoTable.finalY
    const finalY = doc.lastAutoTable.finalY + 8;
    
    // ... (resto del código igual) ...
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: $${(data.total || 0).toLocaleString()}`, 75, finalY, { align: "right" });

    doc.output('dataurlnewwindow');
    
  } catch (error) {
    console.error("Error crítico en el PDF:", error);
    throw error;
  }
};