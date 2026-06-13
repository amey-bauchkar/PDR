import { jsPDF } from 'jspdf';

interface SpecItem {
  label: string;
  value: string;
}

interface ProductDatasheetInput {
  slug: string;
  name: string;
  category: string;
  title: string;
  description: string;
  canonical: string;
  tagline: string;
  features: string[];
  applications: string[];
  specs: SpecItem[];
  related?: { slug: string; name: string }[];
}

export function downloadProductDatasheet(product: ProductDatasheetInput) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = 30;

  const checkSpace = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 30; // reset y, leaving space for the header
    }
  };

  // 1. Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(7, 0, 143); // Deep Blue (#07008F)
  const titleLines = doc.splitTextToSize(product.name, 170);
  doc.text(titleLines, 20, y);
  y += titleLines.length * 8;

  // 2. Category
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(74, 159, 216); // Accent Blue (#4A9FD8)
  doc.text(product.category.toUpperCase(), 20, y);
  y += 6;

  // 3. Tagline
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // Slate Gray (#475569)
  const taglineLines = doc.splitTextToSize(product.tagline || '', 170);
  doc.text(taglineLines, 20, y);
  y += taglineLines.length * 5 + 4;

  // 4. Horizontal Separator
  doc.setDrawColor(226, 232, 240); // Border color (#E2E8F0)
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;

  // 5. Description Block
  if (product.description) {
    checkSpace(15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59); // Dark Gray (#1E293B)
    
    // Split description by lines to support markdown list style splits or multi-line structures
    const descLines = product.description.split('\n');
    for (const descLine of descLines) {
      const trimmed = descLine.trim();
      if (!trimmed) continue;
      
      const wrapped = doc.splitTextToSize(trimmed, 170);
      checkSpace(wrapped.length * 5 + 2);
      doc.text(wrapped, 20, y);
      y += wrapped.length * 5 + 2;
    }
    y += 4;
  }

  // 6. Key Features Block
  if (product.features && product.features.length > 0) {
    checkSpace(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(7, 0, 143);
    doc.text('Key Features', 20, y);
    y += 6;
    
    doc.setDrawColor(7, 0, 143);
    doc.setLineWidth(0.7);
    doc.line(20, y, 35, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    for (const feature of product.features) {
      const wrappedFeature = doc.splitTextToSize(feature, 160);
      checkSpace(wrappedFeature.length * 5 + 2);
      
      // Draw custom beautiful circular bullet
      doc.setFillColor(74, 159, 216);
      doc.circle(23, y - 1.2, 1, 'F');
      
      doc.text(wrappedFeature, 27, y);
      y += wrappedFeature.length * 5 + 3;
    }
    y += 5;
  }

  // 7. Applications Block
  if (product.applications && product.applications.length > 0) {
    checkSpace(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(7, 0, 143);
    doc.text('Applications', 20, y);
    y += 6;
    
    doc.setDrawColor(7, 0, 143);
    doc.setLineWidth(0.7);
    doc.line(20, y, 35, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    for (const app of product.applications) {
      const wrappedApp = doc.splitTextToSize(app, 160);
      checkSpace(wrappedApp.length * 5 + 2);
      
      doc.setFillColor(100, 116, 139);
      doc.circle(23, y - 1.2, 1, 'F');
      
      doc.text(wrappedApp, 27, y);
      y += wrappedApp.length * 5 + 3;
    }
    y += 5;
  }

  // 8. Technical Specifications Table Block
  if (product.specs && product.specs.length > 0) {
    checkSpace(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(7, 0, 143);
    doc.text('Technical Specifications', 20, y);
    y += 6;
    
    doc.setDrawColor(7, 0, 143);
    doc.setLineWidth(0.7);
    doc.line(20, y, 35, y);
    y += 8;

    // Draw table header
    checkSpace(12);
    doc.setFillColor(7, 0, 143);
    doc.rect(20, y, 170, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Parameter / Specification', 24, y + 5.5);
    doc.text('Value / Detail', 94, y + 5.5);
    y += 8;

    // Draw table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    let isRowEven = false;
    for (const spec of product.specs) {
      const labelLines = doc.splitTextToSize(spec.label, 65);
      const valLines = doc.splitTextToSize(spec.value, 95);
      const rowHeight = Math.max(labelLines.length, valLines.length) * 5 + 4;
      
      checkSpace(rowHeight);

      // Row background
      if (isRowEven) {
        doc.setFillColor(248, 250, 252); // Muted slate gray background for even rows
        doc.rect(20, y, 170, rowHeight, 'F');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(20, y, 170, rowHeight, 'F');
      }

      // Draw borders around cells
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(20, y + rowHeight, 190, y + rowHeight); // bottom border
      doc.line(20, y, 20, y + rowHeight);             // left outer border
      doc.line(90, y, 90, y + rowHeight);             // center vertical border
      doc.line(190, y, 190, y + rowHeight);           // right outer border

      // Parameter Column
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text(labelLines, 24, y + 4.5);

      // Value Column
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.text(valLines, 94, y + 4.5);

      y += rowHeight;
      isRowEven = !isRowEven;
    }
  }

  // Draw Header and Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // --- Draw Header ---
    doc.setFillColor(7, 0, 143);
    doc.rect(0, 0, 210, 16, 'F');
    
    doc.setFillColor(74, 159, 216);
    doc.rect(0, 16, 210, 2, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('PDR WORLD', 20, 11);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('PROFESSIONAL PRODUCT DATASHEET', 190, 11, { align: 'right' });

    // --- Draw Footer ---
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PDR World  |  www.pdrworld.com  |  info@pdrworld.com', 20, 286);
    doc.text(`Page ${i} of ${totalPages}`, 190, 286, { align: 'right' });
  }

  // Open the PDF in a new tab for preview instead of directly downloading
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
  return '';
}
