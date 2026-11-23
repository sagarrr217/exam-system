import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = config.resend.apiKey ? new Resend(config.resend.apiKey) : null;

export const sendExamResultEmail = async (params: {
  to: string;
  studentName: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
}): Promise<boolean> => {
  if (!resend) {
    console.warn('Resend API key not configured. Skipping email.');
    return false;
  }

  try {
    const { to, studentName, examTitle, score, totalMarks, percentage, passed } = params;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">Examination Result Notification</h2>
        <p style="color: #334155; font-size: 16px;">Dear <strong>${studentName}</strong>,</p>
        <p style="color: #334155;">Your examination submission for <strong>${examTitle}</strong> has been graded.</p>
        
        <div style="background: ${passed ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${passed ? '#bbf7d0' : '#fecaca'}; padding: 18px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: ${passed ? '#15803d' : '#b91c1c'}; font-size: 20px;">
            Status: ${passed ? 'PASSED 🎉' : 'NEEDS IMPROVEMENT'}
          </h3>
          <p style="margin: 6px 0; font-size: 15px; color: #1e293b;"><strong>Score:</strong> ${score} / ${totalMarks} points</p>
          <p style="margin: 6px 0; font-size: 15px; color: #1e293b;"><strong>Percentage:</strong> ${percentage.toFixed(1)}%</p>
        </div>

        <p style="color: #64748b; font-size: 14px;">You can view detailed insights and question breakdowns by logging into the Student Examination Portal.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">Dual-Interface Examination System &bull; Automated Academic Notification</p>
      </div>
    `;

    // Note: Free Resend without verified custom domain sends to onboarding/test email or verified domain
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: `Exam Result: ${examTitle} - ${passed ? 'Passed' : 'Completed'}`,
      html: htmlContent
    });

    console.log(`Email successfully dispatched via Resend to ${to}`);
    return true;
  } catch (error: any) {
    console.error('Error sending email via Resend:', error);
    return false;
  }
};
