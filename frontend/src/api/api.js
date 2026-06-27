import supabase from '../supabaseClient';

const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Auto-seed demo data into Supabase if tables are empty
/*async function seedDemoDataIfEmpty() {
  if (!isSupabaseConfigured) return;

  try {
    // Check if batches table exists and has data
    const { data: existingBatches, error: checkError } = await supabase
      .from('batches')
      .select('id')
      .limit(1);

    if (checkError) {
      console.warn('%c[Supabase] Tables not found. Please run backend/schema.sql in Supabase SQL Editor.', 'color:#ef4444');
      return;
    }

    if (existingBatches && existingBatches.length > 0) return; // Already has data

    console.log('%c[Supabase] Seeding demo data into your database...', 'color:#10b981');

    const { data: batchData } = await supabase
      .from('batches')
      .insert([
        { name: 'Morning Math Batch', subject: 'Mathematics', schedule: 'Mon-Fri 7:00 - 9:00 AM', monthly_fee: 1500, start_month: 'January', start_year: new Date().getFullYear() },
        { name: 'Evening Science Batch', subject: 'Physics & Chemistry', schedule: 'Mon-Wed-Fri 5:00 - 7:00 PM', monthly_fee: 2000, start_month: 'January', start_year: new Date().getFullYear() },
        { name: 'Weekend English Batch', subject: 'English Grammar', schedule: 'Sat-Sun 10:00 AM - 1:00 PM', monthly_fee: 1200, start_month: 'January', start_year: new Date().getFullYear() },
      ])
      .select();

    if (!batchData) return;

    const [mathBatch, scienceBatch, englishBatch] = batchData;

    const { data: studentData } = await supabase
      .from('students')
      .insert([
        { name: 'Rahul Sharma', mobile: '9876543210', email: 'rahul@email.com', address: '42 Park Street, Delhi', batch_id: mathBatch.id },
        { name: 'Priya Patel', mobile: '9876543211', email: 'priya@email.com', address: '15 Lake View, Mumbai', batch_id: mathBatch.id },
        { name: 'Amit Kumar', mobile: '9876543212', email: 'amit@email.com', address: '88 Green Road, Bengaluru', batch_id: scienceBatch.id },
        { name: 'Sneha Gupta', mobile: '9876543213', email: 'sneha@email.com', address: '23 Hill Top, Pune', batch_id: scienceBatch.id },
        { name: 'Vikram Singh', mobile: '9876543214', email: '', address: '7 River Side, Chennai', batch_id: englishBatch.id },
      ])
      .select();

    if (studentData) {
      const [rahul, priya, amit, sneha] = studentData;
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      const year = new Date().getFullYear();

      await supabase.from('fees_records').insert([
        { student_id: rahul.id, batch_id: mathBatch.id, month: currentMonth, year, amount: 1500, status: 'paid', paid_date: new Date().toISOString(), payment_method: 'UPI' },
        { student_id: priya.id, batch_id: mathBatch.id, month: currentMonth, year, amount: 1500, status: 'pending' },
        { student_id: amit.id, batch_id: scienceBatch.id, month: currentMonth, year, amount: 2000, status: 'paid', paid_date: new Date().toISOString(), payment_method: 'Cash' },
        { student_id: sneha.id, batch_id: scienceBatch.id, month: currentMonth, year, amount: 2000, status: 'pending' },
      ]);
    }

    console.log('%c[Supabase] Demo data seeded successfully!', 'color:#10b981');
  } catch (err) {
    console.warn('[Supabase] Seeding failed (tables may not exist yet):', err.message);
  }
}*/

// Run seeding on app load
// seedDemoDataIfEmpty();

// Helper to map snake_case to camelCase
function mapBatch(b) {
  return {
    id: b.id,
    name: b.name,
    subject: b.subject,
    schedule: b.schedule,
    monthlyFee: Number(b.monthly_fee),
    startMonth: b.start_month || 'January',
    startYear: Number(b.start_year || new Date().getFullYear()),
    createdAt: b.created_at,
  };
}

function mapStudent(s) {
  const rawBatches = s.student_batches || s.studentBatches || [];
  const mappedBatches = rawBatches.map(b => ({
    batchId: b.batch_id || b.batchId,
    discount: Number(b.discount || 0),
    finalFee: Number(b.final_fee !== undefined && b.final_fee !== null ? b.final_fee : (b.finalFee || 0))
  }));

  return {
    id: s.id,
    name: s.name,
    mobile: s.mobile,
    email: s.email || '',
    address: s.address || '',
    batchId: s.batch_id || s.batchId || (mappedBatches[0] ? mappedBatches[0].batchId : null),
    discount: Number(s.discount || 0),
    finalFee: Number(s.final_fee || 0),
    studentBatches: mappedBatches,
    joinDate: s.join_date || s.joinDate,
  };
}

function mapFee(f) {
  return {
    id: f.id,
    studentId: f.student_id,
    batchId: f.batch_id,
    month: f.month,
    year: Number(f.year),
    amount: Number(f.amount),
    status: f.status,
    paidDate: f.paid_date,
    paymentMethod: f.payment_method,
  };
}

export const api = {
  // Auth
  async login(role, credentials) {
    if (role === 'teacher') {
      const password = credentials.password;
      const stored = 'admin@79';
      if (password === stored) {
        return { success: true, auth: { role: 'teacher', userId: 'teacher' } };
      }
      return { success: false, error: 'Incorrect password' };
    }

    // Student login
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('mobile', credentials.mobile)
          .single();

        if (error || !data) {
          return { success: false, error: 'No student found with this mobile number' };
        }

        return {
          success: true,
          auth: {
            role: 'student',
            userId: data.id,
            studentMobile: data.mobile,
          },
        };
      } catch (err) {
        console.error(err);
      }
    }

    // Fallback to localStorage
    const students = JSON.parse(localStorage.getItem('fees_students') || '[]');
    const student = students.find((s) => s.mobile === credentials.mobile);
    if (student) {
      return { success: true, auth: { role: 'student', userId: student.id, studentMobile: student.mobile } };
    }
    return { success: false, error: 'No student found with this mobile number' };
  },

  // Batches
  async getBatches() {
    const demoBatches = ['Morning Math Batch', 'Evening Science Batch', 'Weekend English Batch'];
    let rawBatches = [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
        if (!error && data) rawBatches = data.map(mapBatch);
      } catch (e) {
        console.error(e);
      }
    } else {
      rawBatches = JSON.parse(localStorage.getItem('fees_batches') || '[]');
    }
    return rawBatches.filter(b => !demoBatches.includes(b.name));
  },

  async addBatch(batch) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .insert([{
            name: batch.name,
            subject: batch.subject,
            schedule: batch.schedule,
            monthly_fee: batch.monthlyFee,
            start_month: batch.startMonth,
            start_year: batch.startYear,
          }])
          .select()
          .single();
        if (!error && data) return mapBatch(data);
      } catch (e) {
        console.error(e);
      }
    }
    const list = JSON.parse(localStorage.getItem('fees_batches') || '[]');
    list.push(batch);
    localStorage.setItem('fees_batches', JSON.stringify(list));
    return batch;
  },

  async updateBatch(id, batch) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .update({
            name: batch.name,
            subject: batch.subject,
            schedule: batch.schedule,
            monthly_fee: batch.monthlyFee,
            start_month: batch.startMonth,
            start_year: batch.startYear,
          })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return mapBatch(data);
      } catch (e) {
        console.error(e);
      }
    }
    const list = JSON.parse(localStorage.getItem('fees_batches') || '[]');
    const updated = list.map((b) => (b.id === id ? batch : b));
    localStorage.setItem('fees_batches', JSON.stringify(updated));
    return batch;
  },

  async deleteBatch(id) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('batches').delete().eq('id', id);
        return true;
      } catch (e) {
        console.error(e);
      }
    }
    const list = JSON.parse(localStorage.getItem('fees_batches') || '[]');
    localStorage.setItem('fees_batches', JSON.stringify(list.filter((b) => b.id !== id)));
    return true;
  },

  // Students
  async getStudents() {
    const demoMobiles = ['9876543210', '9876543211', '9876543212', '9876543213', '9876543214'];
    const demoNames = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh', 'Test Student Pro', 'Test Student'];
    const isDemo = (s) => demoMobiles.includes(s.mobile) || demoNames.includes(s.name);

    const backendUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'}/api/students`;
    try {
      const res = await fetch(backendUrl);
      if (res.ok) {
        const data = await res.json();
        return data.map(mapStudent).filter(s => !isDemo(s));
      }
    } catch (e) {
      console.warn('[API] Backend unreachable for getStudents, attempting direct Supabase query');
    }

    let rawStudents = [];
    if (isSupabaseConfigured) {
      try {
        const { data: students, error } = await supabase.from('students').select('*').order('join_date', { ascending: false });
        const { data: enrollments } = await supabase.from('student_batches').select('*');
        if (!error && students) {
          rawStudents = students.map(s => mapStudent({
            ...s,
            student_batches: enrollments ? enrollments.filter(e => e.student_id === s.id) : []
          }));
        }
      } catch (e) {
        console.warn('Supabase students fetch failed, using localStorage');
      }
    } else {
      rawStudents = JSON.parse(localStorage.getItem('fees_students') || '[]');
    }
    return rawStudents.filter(s => !isDemo(s));
  },

  async addStudent(student) {
    const backendUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'}/api/students`;
    console.log(`[API] Attempting to add student via backend: ${backendUrl}`);

    const payload = {
      name: student.name,
      mobile: student.mobile,
      email: student.email,
      address: student.address,
      batchId: student.batchId,
      discount: student.discount,
      finalFee: student.finalFee,
      batches: student.studentBatches || student.batches || []
    };

    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return mapStudent(data);
      }
    } catch (e) {
      console.warn('[API] Backend unreachable for addStudent. Falling back to direct Supabase insert.');
    }

    // Fallback: direct Supabase insert
    if (isSupabaseConfigured) {
      try {
        const primaryBatch = payload.batches[0] || {};
        const { data, error } = await supabase
          .from('students')
          .insert([{
            name: student.name,
            mobile: student.mobile,
            email: student.email,
            address: student.address,
            batch_id: primaryBatch.batchId || student.batchId,
            discount: primaryBatch.discount !== undefined ? primaryBatch.discount : student.discount,
            final_fee: primaryBatch.finalFee !== undefined ? primaryBatch.finalFee : student.finalFee
          }])
          .select()
          .single();
        if (!error && data) {
          if (payload.batches.length > 0) {
            const enrollmentsToInsert = payload.batches.map(b => ({
              student_id: data.id,
              batch_id: b.batchId,
              discount: b.discount,
              final_fee: b.finalFee
            }));
            await supabase.from('student_batches').insert(enrollmentsToInsert);
          }
          return mapStudent(data);
        }
      } catch (e) {
        console.error('[API] Supabase insert failed:', e.message);
      }
    }

    const list = JSON.parse(localStorage.getItem('fees_students') || '[]');
    list.push(student);
    localStorage.setItem('fees_students', JSON.stringify(list));
    return student;
  },

  async updateStudent(id, student) {
    const backendUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'}/api/students/${id}`;
    const payload = {
      name: student.name,
      mobile: student.mobile,
      email: student.email,
      address: student.address,
      batchId: student.batchId,
      discount: student.discount,
      finalFee: student.finalFee,
      batches: student.studentBatches || student.batches || []
    };

    try {
      const res = await fetch(backendUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return mapStudent(data);
      }
    } catch (e) {
      console.warn('[API] Backend unreachable for updateStudent.');
    }

    if (isSupabaseConfigured) {
      try {
        const primaryBatch = payload.batches[0] || {};
        const { data, error } = await supabase
          .from('students')
          .update({
            name: student.name,
            mobile: student.mobile,
            email: student.email,
            address: student.address,
            batch_id: primaryBatch.batchId || student.batchId,
            discount: primaryBatch.discount !== undefined ? primaryBatch.discount : student.discount,
            final_fee: primaryBatch.finalFee !== undefined ? primaryBatch.finalFee : student.finalFee
          })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          await supabase.from('student_batches').delete().eq('student_id', id);
          if (payload.batches.length > 0) {
            const enrollmentsToInsert = payload.batches.map(b => ({
              student_id: id,
              batch_id: b.batchId,
              discount: b.discount,
              final_fee: b.finalFee
            }));
            await supabase.from('student_batches').insert(enrollmentsToInsert);
          }
          return mapStudent(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    const list = JSON.parse(localStorage.getItem('fees_students') || '[]');
    const updated = list.map((s) => (s.id === id ? student : s));
    localStorage.setItem('fees_students', JSON.stringify(updated));
    return student;
  },

  async deleteStudent(id) {
    const backendUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'}/api/students/${id}`;
    try {
      await fetch(backendUrl, { method: 'DELETE' });
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        await supabase.from('student_batches').delete().eq('student_id', id);
        await supabase.from('students').delete().eq('id', id);
        return true;
      } catch (e) {
        console.error(e);
      }
    }
    const list = JSON.parse(localStorage.getItem('fees_students') || '[]');
    localStorage.setItem('fees_students', JSON.stringify(list.filter((s) => s.id !== id)));
    return true;
  },

  // Fees
  async getFees() {
    let rawFees = [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('fees_records').select('*').order('created_at', { ascending: false });
        if (!error && data) rawFees = data.map(mapFee);
      } catch (e) {
        console.error(e);
      }
    } else {
      rawFees = JSON.parse(localStorage.getItem('fees_records') || '[]');
    }

    // Filter out fees associated with demo students
    const activeStudents = await api.getStudents();
    const activeStudentIds = new Set(activeStudents.map(s => s.id));
    return rawFees.filter(f => activeStudentIds.has(f.studentId));
  },

  async addFee(fee) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('fees_records')
          .insert([{
            student_id: fee.studentId,
            batch_id: fee.batchId,
            month: fee.month,
            year: fee.year,
            amount: fee.amount,
            status: fee.status,
            paid_date: fee.paidDate,
            payment_method: fee.paymentMethod,
          }])
          .select()
          .single();
        if (!error && data) return mapFee(data);
      } catch (e) {
        console.error(e);
      }
    }
    const list = JSON.parse(localStorage.getItem('fees_records') || '[]');
    list.push(fee);
    localStorage.setItem('fees_records', JSON.stringify(list));
    return fee;
  },

  async updateFee(id, fee) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('fees_records')
          .update({
            status: fee.status,
            paid_date: fee.paidDate,
            payment_method: fee.paymentMethod,
          })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return mapFee(data);
      } catch (e) {
        console.error(e);
      }
    }
    const list = JSON.parse(localStorage.getItem('fees_records') || '[]');
    const updated = list.map((f) => (f.id === id ? { ...f, ...fee } : f));
    localStorage.setItem('fees_records', JSON.stringify(updated));
    return fee;
  },

  async deleteFee(id) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('fees_records').delete().eq('id', id);
        return true;
      } catch (e) {
        console.error(e);
      }
    }
    const list = JSON.parse(localStorage.getItem('fees_records') || '[]');
    localStorage.setItem('fees_records', JSON.stringify(list.filter((f) => f.id !== id)));
    return true;
  },

  // SMS Notifications API
  async sendPendingSMS(studentId = null) {
    const backendUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'}/api/sms/send-pending-manual`;
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[API] Failed to trigger pending SMS:', error.message);
      return { success: false, error: error.message };
    }
  }
};
