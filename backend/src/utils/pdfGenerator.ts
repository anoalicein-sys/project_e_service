import puppeteer from 'puppeteer';

export const generateServiceReportPDF = async (reportData: any): Promise<Buffer> => {
  // Create highly professional HTML template mapped with reportData
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Service Report - ${reportData.reportNo}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; font-size: 14px; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a56db; padding-bottom: 10px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #1a56db; }
        .report-title { font-size: 20px; text-transform: uppercase; color: #555; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; background-color: #f3f4f6; padding: 5px 10px; border-left: 4px solid #1a56db; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .field { margin-bottom: 5px; }
        .label { font-weight: bold; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f9fafb; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">E-Service Pro</div>
          <div class="report-title">Service Report</div>
        </div>
        
        <div class="section grid">
          <div>
            <div class="field"><span class="label">Report No:</span> ${reportData.reportNo}</div>
            <div class="field"><span class="label">Date:</span> ${new Date(reportData.reportDate).toLocaleDateString()}</div>
            <div class="field"><span class="label">Status:</span> ${reportData.approvalStatus}</div>
          </div>
          <div>
            <div class="field"><span class="label">Customer:</span> ${reportData.customerId?.name || 'N/A'}</div>
            <div class="field"><span class="label">Machine Model:</span> ${reportData.machineId?.model || 'N/A'}</div>
            <div class="field"><span class="label">Serial No:</span> ${reportData.machineId?.serialNo || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Job Details</div>
          <div class="grid">
            <div class="field"><span class="label">Job Title:</span> ${reportData.jobTitle}</div>
            <div class="field"><span class="label">Category:</span> ${reportData.jobCategory}</div>
            <div class="field"><span class="label">Charges Type:</span> ${reportData.chargesType}</div>
            <div class="field"><span class="label">Engineer:</span> ${reportData.engineerId?.name || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Service Details</div>
          <div class="field"><span class="label">Observation:</span> <p>${reportData.observation}</p></div>
          <div class="field"><span class="label">Cause of Failure:</span> <p>${reportData.causeOfFailure}</p></div>
          <div class="field"><span class="label">Action Taken:</span> <p>${reportData.actionTaken}</p></div>
          <div class="field"><span class="label">Recommendation:</span> <p>${reportData.recommendation}</p></div>
        </div>

        <div class="section">
          <div class="section-title">Work Time Log</div>
          <table>
            <thead>
              <tr>
                <th>Engineer</th>
                <th>Time From</th>
                <th>Time Upto</th>
                <th>Hours Logged</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.workTime.map((wt: any) => `
                <tr>
                  <td>${wt.engineerName}</td>
                  <td>${new Date(wt.timeFrom).toLocaleString()}</td>
                  <td>${new Date(wt.timeUpto).toLocaleString()}</td>
                  <td>${wt.workTime}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          This is a system-generated document and does not require a physical signature.
        </div>
      </div>
    </body>
    </html>
  `;

  // Launch Puppeteer.
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Essential for Docker/Serverless
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return Buffer.from(pdfBuffer);
};
