import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in environmental variables!');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

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
app.listen(PORT, () => {
  console.log(`EduFees Node.js backend is running on http://localhost:${PORT}`);
});
