import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in environmental variables!');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Email Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify email connection at startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
  } else {
    console.log('✅ Email transporter is ready to send messages');
  }
});

async function sendWelcomeEmail(studentName, studentEmail) {
  if (!studentEmail) {
    console.log('⚠️  Skipping welcome email: No student email address provided.');
    return;
  }
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Skipping welcome email: EMAIL_USER or EMAIL_PASS not set in .env');
    return;
  }

  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  const mailOptions = {
    from: `"EduFees" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: '🎉 Welcome to EduFees!',
    text: `Hi ${studentName},\n\nYou have been successfully enrolled in our system by your teacher.\n\nYou can now log in to EduFees to track your fee payments here: ${appUrl}\n\nBest regards,\nEduFees Team`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:#4f46e5;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">Welcome to EduFees!</h1>
        </div>
        <div style="padding:24px">
          <p style="font-size:16px;color:#334155">Hi <strong>${studentName}</strong>,</p>
          <p style="color:#475569">You have been successfully enrolled in our system by your teacher.</p>
          <p style="color:#475569">You can now track your fee payments by logging into the portal:</p>
          
          <div style="text-align:center;margin:30px 0">
            <a href="${appUrl}" style="background:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">
              Open EduFees App
            </a>
          </div>

          <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-top:16px">
            <p style="margin:0;color:#64748b;font-size:13px">📱 Login with your registered mobile number.</p>
            <p style="margin:4px 0 0 0;color:#64748b;font-size:12px;word-break:break-all">${appUrl}</p>
          </div>
          <p style="margin-top:24px;color:#94a3b8;font-size:13px">Best regards,<br/><strong>EduFees Team</strong></p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${studentEmail} [MessageId: ${info.messageId}]`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${studentEmail}:`, error.message);
  }
}

// Health & Environment Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: {
      SUPABASE_URL_SET: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY_SET: !!process.env.SUPABASE_ANON_KEY,
      EMAIL_USER_SET: !!process.env.EMAIL_USER,
      EMAIL_PASS_SET: !!process.env.EMAIL_PASS ? 'SET (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET',
      TEACHER_PASSWORD_SET: !!process.env.TEACHER_PASSWORD,
      APP_URL: process.env.APP_URL || 'not set',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    }
  });
});

// Authentication API
app.post('/api/auth/login', async (req, res) => {
  const { role, password, mobile } = req.body;

  try {
    if (role === 'teacher') {
      const storedPassword = process.env.TEACHER_PASSWORD || 'teacher123';
      if (password === storedPassword) {
        return res.json({
          success: true,
          role: 'teacher',
          userId: 'teacher',
          token: 'teacher-session-token'
        });
      } else {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }
    }

    if (role === 'student') {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('mobile', mobile)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'No student found with this mobile number' });
      }

      return res.json({
        success: true,
        role: 'student',
        userId: data.id,
        studentMobile: data.mobile,
        studentName: data.name
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid role' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// BATCHES ENDPOINTS
app.get('/api/batches', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/batches', async (req, res) => {
  const { name, subject, schedule, monthlyFee, startMonth, startYear } = req.body;
  try {
    const { data, error } = await supabase
      .from('batches')
      .insert([{
        name,
        subject,
        schedule,
        monthly_fee: monthlyFee,
        start_month: startMonth,
        start_year: startYear,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/batches/:id', async (req, res) => {
  const { id } = req.params;
  const { name, subject, schedule, monthlyFee, startMonth, startYear } = req.body;
  try {
    const { data, error } = await supabase
      .from('batches')
      .update({
        name,
        subject,
        schedule,
        monthly_fee: monthlyFee,
        start_month: startMonth,
        start_year: startYear,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/batches/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Batch deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// STUDENTS ENDPOINTS
app.get('/api/students', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('join_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  const { name, mobile, email, address, batchId, discount, finalFee } = req.body;
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([{ name, mobile, email, address, batch_id: batchId, discount, final_fee: finalFee }])
      .select()
      .single();

    if (error) throw error;
    
    // Send welcome email (asynchronously)
    if (data && data.email) {
      await sendWelcomeEmail(data.name, data.email);
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { name, mobile, email, address, batchId, discount, finalFee } = req.body;
  try {
    const { data, error } = await supabase
      .from('students')
      .update({ name, mobile, email, address, batch_id: batchId, discount, final_fee: finalFee })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FEES ENDPOINTS
app.get('/api/fees', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fees_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fees', async (req, res) => {
  const { studentId, batchId, month, year, amount, status, paymentMethod } = req.body;
  try {
    const { data, error } = await supabase
      .from('fees_records')
      .insert([{
        student_id: studentId,
        batch_id: batchId,
        month,
        year,
        amount,
        status,
        paid_date: status === 'paid' ? new Date().toISOString() : null,
        payment_method: status === 'paid' ? paymentMethod : null
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/fees/:id', async (req, res) => {
  const { id } = req.params;
  const { status, paymentMethod } = req.body;
  try {
    const { data, error } = await supabase
      .from('fees_records')
      .update({
        status,
        paid_date: status === 'paid' ? new Date().toISOString() : null,
        payment_method: status === 'paid' ? paymentMethod : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/fees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('fees_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Fee record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// START SERVER
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`EduFees Node.js backend is running on http://localhost:${PORT}`);
  });
}

export default app;
