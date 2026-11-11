import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportsDir = path.join(__dirname, '../../uploads/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

export const createPdfReport = (filename, title, patientName, doctorName, date, details) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(reportsDir, filename);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Header styling
    doc
      .rect(0, 0, doc.page.width, 100)
      .fill('#0284c7');

    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .text('MediSlot Healthcare Network', 50, 30, { align: 'left' })
      .fontSize(11)
      .text('Official Clinical Diagnostic & Consultation Summary', 50, 60);

    // Metadata box
    doc
      .rect(50, 120, doc.page.width - 100, 100)
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .stroke();

    doc
      .fillColor('#0f172a')
      .fontSize(12)
      .text(`Report Title: ${title}`, 70, 135)
      .text(`Patient Name: ${patientName}`, 70, 155)
      .text(`Consulting Doctor: ${doctorName}`, 70, 175)
      .text(`Date of Issue: ${date}`, 350, 135)
      .text(`Status: Verified & Signed`, 350, 155)
      .text(`Facility: MediSlot Specialty Center`, 350, 175);

    // Report Content
    doc
      .fontSize(14)
      .fillColor('#0284c7')
      .text('Clinical Observations & Diagnostic Findings', 50, 245);

    doc
      .moveTo(50, 265)
      .lineTo(doc.page.width - 50, 265)
      .strokeColor('#cbd5e1')
      .stroke();

    doc
      .fontSize(11)
      .fillColor('#334155')
      .text(details.findings || 'All evaluated parameters conform to clinical reference standards.', 50, 280, {
        width: doc.page.width - 100,
        lineGap: 4,
      });

    // Laboratory Values / Test Table
    if (details.parameters && details.parameters.length > 0) {
      doc
        .fontSize(13)
        .fillColor('#0284c7')
        .text('Detailed Parameter Breakdown', 50, 380);

      let currentY = 405;
      details.parameters.forEach((item) => {
        doc
          .fontSize(10)
          .fillColor('#1e293b')
          .text(item.name, 60, currentY)
          .text(item.value, 260, currentY)
          .fillColor('#64748b')
          .text(`(Ref: ${item.refRange})`, 380, currentY);
        currentY += 22;
      });
    }

    // Prescription / Advice
    doc
      .fontSize(13)
      .fillColor('#0284c7')
      .text('Medical Advice & Recommended Follow-up', 50, 560);

    doc
      .fontSize(10)
      .fillColor('#334155')
      .text(details.advice || 'Continue prescribed regimen. Report immediately if symptoms exacerbate.', 50, 580, {
        width: doc.page.width - 100,
        lineGap: 4,
      });

    // Footer
    doc
      .fontSize(9)
      .fillColor('#94a3b8')
      .text('This is a computer-generated medical record authorized by MediSlot Clinical Information Systems.', 50, 750, {
        align: 'center',
      });

    doc.end();

    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', (err) => reject(err));
  });
};
