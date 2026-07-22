/**
 * Utility tools for exporting table data to Excel (.csv) and PDF print view.
 */

export const exportToCSV = (
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) => {
  const sanitizeCell = (cell: string | number | boolean | null | undefined): string => {
    if (cell === null || cell === undefined) return '""';
    const cellStr = String(cell).replace(/"/g, '""');
    return `"${cellStr}"`;
  };

  const csvRows = [
    headers.map(sanitizeCell).join(','),
    ...rows.map(row => row.map(sanitizeCell).join(','))
  ];

  const csvContent = '\uFEFF' + csvRows.join('\n'); // Add UTF-8 BOM for Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (
  title: string,
  subtitle: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  summaryInfo?: { label: string; value: string }[]
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir oleh browser. Mohon izinkan pop-up untuk mencetak PDF.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title} - YatimCare Sumedang</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #059669;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .org-title {
          font-size: 18px;
          font-weight: bold;
          color: #065f46;
          margin: 0;
        }
        .org-sub {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
        }
        .doc-title {
          text-align: right;
        }
        .doc-title h2 {
          margin: 0;
          font-size: 14px;
          color: #0f172a;
          text-transform: uppercase;
        }
        .doc-title p {
          margin: 2px 0 0 0;
          font-size: 10px;
          color: #64748b;
        }
        .summary-box {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
        }
        .summary-item {
          flex: 1;
        }
        .summary-item .label {
          font-size: 9px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: bold;
        }
        .summary-item .val {
          font-size: 12px;
          color: #0f172a;
          font-weight: bold;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f1f5f9;
          color: #334155;
          font-weight: bold;
          text-align: left;
          padding: 8px 10px;
          font-size: 10px;
          border-bottom: 2px solid #cbd5e1;
          text-transform: uppercase;
        }
        td {
          padding: 8px 10px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 10px;
          color: #1e293b;
        }
        tr:nth-child(even) {
          background-color: #fafafa;
        }
        .footer-sign {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .sign-box {
          text-align: center;
          width: 180px;
        }
        .sign-title {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 50px;
        }
        .sign-name {
          font-weight: bold;
          text-decoration: underline;
        }
        .sign-role {
          font-size: 9px;
          color: #64748b;
        }
        .no-print-bar {
          background: #065f46;
          color: #ffffff;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-radius: 6px;
        }
        .btn-print {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 16px;
          font-weight: bold;
          border-radius: 4px;
          cursor: pointer;
        }
        @media print {
          .no-print-bar {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <span><strong>Laporan PDF / Cetak Laporan Resmi</strong> - Silakan klik tombol atau tekan Ctrl+P untuk menyimpannya sebagai PDF.</span>
        <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="org-title">YAYASAN YATIMCARE SUMEDANG</div>
          <div class="org-sub">Sistem Informasi Pengelolaan Anak Yatim, Donasi & Transparansi Public</div>
          <div class="org-sub">Jl. Angkrek No. 45, Kabupaten Sumedang, Jawa Barat 45311</div>
        </div>
        <div class="doc-title">
          <h2>${title}</h2>
          <p>${subtitle}</p>
          <p>Tanggal Cetak: ${dateStr}</p>
        </div>
      </div>

      ${
        summaryInfo && summaryInfo.length > 0
          ? `<div class="summary-box">
              ${summaryInfo
                .map(
                  s => `
                <div class="summary-item">
                  <div class="label">${s.label}</div>
                  <div class="val">${s.value}</div>
                </div>
              `
                )
                .join('')}
            </div>`
          : ''
      }

      <table>
        <thead>
          <tr>
            <th>#</th>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row, idx) => `
            <tr>
              <td>${idx + 1}</td>
              ${row.map(cell => `<td>${cell ?? '-'}</td>`).join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="footer-sign">
        <div class="sign-box">
          <div class="sign-title">Diperiksa Oleh</div>
          <div class="sign-name">H. Kurniawan, S.E.</div>
          <div class="sign-role">Ketua Pengurus Yayasan</div>
        </div>
        <div class="sign-box">
          <div class="sign-title">Sumedang, ${dateStr.split(',')[1] || dateStr}</div>
          <div class="sign-name">Hj. Ratna Pertiwi</div>
          <div class="sign-role">Bendahara / Sekretariat</div>
        </div>
      </div>

    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
