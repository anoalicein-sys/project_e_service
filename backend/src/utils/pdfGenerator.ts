import puppeteer from 'puppeteer';

export const generateServiceReportPDF = async (reportData: any): Promise<Buffer> => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Service Report - ${reportData.reportNo}</title>
      <style>
        @page { margin: 20px 30px; }
        body { font-family: 'Arial', sans-serif; color: #000; line-height: 1.3; font-size: 11px; margin: 0; padding: 0; }
        
        .header { text-align: center; margin-bottom: 10px; position: relative; }
        .logo-area { position: absolute; left: 0; top: 0; text-align: left; }
        .logo-text { color: #0066cc; font-weight: bold; font-size: 20px; font-style: italic; }
        .logo-sub { color: #0066cc; font-size: 8px; font-weight: bold; }
        .company-name { color: #0088cc; font-size: 22px; font-weight: bold; margin-bottom: 5px; }
        .company-address { font-size: 10px; }
        
        .section-header { background-color: #e2e2e2; font-weight: bold; padding: 4px 8px; font-size: 12px; margin-top: 15px; margin-bottom: 5px; border: 1px solid #ccc; }
        
        table.layout-table { width: 100%; border-collapse: collapse; }
        table.layout-table td { padding: 3px 0; vertical-align: top; }
        .col-label { width: 120px; }
        .col-colon { width: 10px; }
        
        table.data-table { width: 100%; border-collapse: collapse; margin-top: 5px; border: 1px solid #ccc; }
        table.data-table th, table.data-table td { border: 1px solid #ccc; padding: 4px; text-align: left; }
        table.data-table th { background-color: #f9f9f9; font-weight: bold; }

        .text-block { margin-top: 10px; }
        .text-block-title { font-weight: bold; font-size: 12px; margin-bottom: 2px; }
        .text-block-content { white-space: pre-wrap; margin-bottom: 10px; }
        
        .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-box { width: 30%; text-align: center; }
        .signature-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
        .signature-name { margin-bottom: 5px; }
        .signature-img { height: 60px; width: 120px; object-fit: contain; display: inline-block; }
        .no-signature { color: red; font-size: 12px; border: 1px solid red; display: inline-block; padding: 2px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-area">
          <div class="logo-text">NMTronics</div>
          <div class="logo-sub">Partners in Technology</div>
        </div>
        <div class="company-name">NMTronics India Pvt Ltd</div>
        <div class="company-address">SDF NO. E-17 & C-2, Noida Special Economic Zone Noida Dadri Road, Phase-II, Noida- 201 305, U.P.<br>INDIA., Noida, Uttar Pradesh, India - 201301</div>
      </div>

      <div class="section-header" style="text-align: center;">Service Report</div>
      
      <table class="layout-table">
        <tr>
          <td class="col-label">Report No.</td><td class="col-colon">:</td><td>${reportData.reportNo}</td>
          <td class="col-label" style="width:130px;">Service Request No.</td><td class="col-colon">:</td><td>${reportData.requestId?.reportNo || 'N/A'}</td>
        </tr>
        <tr>
          <td class="col-label">Report Date</td><td class="col-colon">:</td><td colspan="4">${formatDate(reportData.reportDate)}</td>
        </tr>
      </table>
      <div style="border-bottom: 1px solid #ccc; margin: 5px 0;"></div>
      <table class="layout-table">
        <tr>
          <td class="col-label">Customer Name</td><td class="col-colon">:</td><td>${reportData.customerId?.name || ''}</td>
          <td class="col-label" style="width:100px;">Plant Name</td><td class="col-colon">:</td><td>${reportData.plantName || ''}</td>
        </tr>
        <tr>
          <td class="col-label">Plant Address</td><td class="col-colon">:</td><td colspan="4">${reportData.plantAddress || ''}</td>
        </tr>
        <tr>
          <td colspan="3"></td>
          <td class="col-label" style="width:100px;">Att. Name</td><td class="col-colon">:</td><td>${reportData.attName || ''}</td>
        </tr>
      </table>

      <div class="section-header">Job Detail</div>
      <table class="layout-table">
        <tr>
          <td class="col-label">Job Title</td><td class="col-colon">:</td><td colspan="4">${reportData.jobTitle || ''}</td>
        </tr>
        <tr>
          <td class="col-label">Job Category</td><td class="col-colon">:</td><td>${reportData.jobCategory || ''}</td>
          <td class="col-label" style="width:100px;">Service Type</td><td class="col-colon">:</td><td>${reportData.serviceType || 'On Site'}</td>
        </tr>
        <tr>
          <td class="col-label">Charges Type</td><td class="col-colon">:</td><td colspan="4">${reportData.chargesType || ''}</td>
        </tr>
      </table>

      <div class="section-header">Equipment Detail</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Model</th>
            <th>Serial No.</th>
            <th>Category</th>
            <th>Install. Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${reportData.machineId?.type || ''}</td>
            <td>${reportData.machineId?.model || ''}</td>
            <td>${reportData.machineId?.serialNo || ''}</td>
            <td>${reportData.jobCategory || ''}</td>
            <td>${formatDate(reportData.machineId?.installDate)}</td>
          </tr>
        </tbody>
      </table>

      <div class="text-block">
        <div class="text-block-title">Observation</div>
        <div class="text-block-content">${reportData.observation || ''}</div>
      </div>
      
      <div class="text-block">
        <div class="text-block-title">Cause Of Failure</div>
        <div class="text-block-content">${reportData.causeOfFailure || ''}</div>
      </div>

      <div class="text-block">
        <div class="text-block-title">Action Taken</div>
        <div class="text-block-content">${reportData.actionTaken || ''}</div>
      </div>

      <div class="text-block">
        <div class="text-block-title">Recommendation</div>
        <div class="text-block-content">${reportData.recommendation || ''}</div>
      </div>

      <div class="section-header">Work Time</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:30px;">SNo.</th>
            <th>Time From</th>
            <th>Time Upto</th>
            <th>Work Time</th>
            <th>Engineer</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.workTime.map((wt: any, index: number) => `
            <tr>
              <td>${index + 1}</td>
              <td>${formatDateTime(wt.timeFrom)}</td>
              <td>${formatDateTime(wt.timeUpto)}</td>
              <td>${wt.workTime} mins</td>
              <td>${wt.engineerName}</td>
              <td>${wt.remark || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="signature-section">
        <div class="signature-box" style="text-align:left;">
          <div class="signature-title">Service By</div>
          <div class="signature-name">${reportData.engineerId?.name || ''}</div>
          ${reportData.engineerSignature ? `<img class="signature-img" src="${reportData.engineerSignature}" />` : '<div class="no-signature">x</div>'}
        </div>
        <div class="signature-box" style="text-align:left;">
          <div class="signature-title">Customer Sign</div>
          <div class="signature-name">${reportData.attName || 'Customer'}</div>
          ${reportData.customerSignature ? `<img class="signature-img" src="${reportData.customerSignature}" />` : '<div class="no-signature">x</div>'}
        </div>
        <div class="signature-box" style="text-align:left;">
          <div class="signature-title">Verified By</div>
          <div class="signature-name">Manager</div>
          ${reportData.approvalStatus === 'Approved' ? '<div style="color:green; font-weight:bold; height:60px;">[System Approved]</div>' : '<div class="no-signature">x</div>'}
        </div>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return Buffer.from(pdfBuffer);
};
