// API client with Supabase / Node.js backend integration and transparent LocalStorage fallback.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to check if server is reachable
async function checkBackendReachable() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/batches`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

let isBackendActive = false;

// Dynamic check on startup
checkBackendReachable().then((status) => {
  isBackendActive = status;
  if (status) {
    console.log(`EduFees: Connected to Node.js / Supabase Backend at ${API_BASE_URL}`);
  } else {
    console.log('EduFees: Node.js server offline. Using ultra-responsive localStorage engine.');
  }
});

export const api = {
  // Auth
  async login(role, credentials) {
    if (isBackendActive) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, ...credentials }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          return { success: true, auth: { role: data.role, userId: data.userId, studentMobile: data.studentMobile } };
        }
        return { success: false, error: data.message || 'Login failed' };
      } catch (err) {
        console.error('Backend Login failed, falling back:', err);
      }
    }

    // LocalStorage Fallback
    if (role === 'teacher') {
      const storedPassword = localStorage.getItem('fees_teacher_password') || 'teacher123';
      if (credentials.password === storedPassword) {
        return { success: true, auth: { role: 'teacher', userId: 'teacher' } };
      }
      return { success: false, error: 'Invalid password. Default: teacher123' };
    } else {
      const students = JSON.parse(localStorage.getItem('fees_students') || '[]');
      const student = students.find((s) => s.mobile === credentials.mobile);
      if (student) {
        return { success: true, auth: { role: 'student', userId: student.id, studentMobile: student.mobile } };
      }
      return { success: false, error: 'No student found with this mobile number.' };
    }
  },

  // Batches CRUD
  async getBatches() {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/batches`);
        if (res.ok) {
          const data = await res.json();
          // Map snake_case to camelCase
          return data.map((b) => ({
            id: b.id,
            name: b.name,
            subject: b.subject,
            schedule: b.schedule,
            monthlyFee: Number(b.monthly_fee),
            createdAt: b.created_at,
          }));
        }
      } catch (err) {
        console.error('Error fetching batches:', err);
      }
    }
    return JSON.parse(localStorage.getItem('fees_batches') || '[]');
  },

  async addBatch(batch) {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/batches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: batch.name,
            subject: batch.subject,
            schedule: batch.schedule,
            monthlyFee: batch.monthlyFee,
          }),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error('Error adding batch:', err);
      }
    }
    const current = JSON.parse(localStorage.getItem('fees_batches') || '[]');
    current.push(batch);
    localStorage.setItem('fees_batches', JSON.stringify(current));
    return batch;
  },

  async updateBatch(id, batch) {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/batches/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: batch.name,
            subject: batch.subject,
            schedule: batch.schedule,
            monthlyFee: batch.monthlyFee,
          }),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error('Error updating batch:', err);
      }
    }
    const current = JSON.parse(localStorage.getItem('fees_batches') || '[]');
    const next = current.map((b) => (b.id === id ? batch : b));
    localStorage.setItem('fees_batches', JSON.stringify(next));
    return batch;
  },

  async deleteBatch(id) {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/batches/${id}`, { method: 'DELETE' });
        if (res.ok) return true;
      } catch (err) {
        console.error('Error deleting batch:', err);
      }
    }
    const current = JSON.parse(localStorage.getItem('fees_batches') || '[]');
    localStorage.setItem('fees_batches', JSON.stringify(current.filter((b) => b.id !== id)));
    return true;
  },

  // Students CRUD
  async getStudents() {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/students`);
        if (res.ok) {
          const data = await res.json();
          // Map snake_case to camelCase
          return data.map((s) => ({
            id: s.id,
            name: s.name,
            mobile: s.mobile,
            email: s.email,
            address: s.address,
            batchId: s.batch_id,
            joinDate: s.join_date,
          }));
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    }
    return JSON.parse(localStorage.getItem('fees_students') || '[]');
  },

  async addStudent(student) {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: student.name,
            mobile: student.mobile,
            email: student.email,
            address: student.address,
            batchId: student.batchId,
          }),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error('Error adding student:', err);
      }
    }
    const current = JSON.parse(localStorage.getItem('fees_students') || '[]');
    current.push(student);
    localStorage.setItem('fees_students', JSON.stringify(current));
    return student;
  },

  async updateStudent(id, student) {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/students/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: student.name,
            mobile: student.mobile,
            email: student.email,
            address: student.address,
            batchId: student.batchId,
          }),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error('Error updating student:', err);
      }
    }
    const current = JSON.parse(localStorage.getItem('fees_students') || '[]');
    const next = current.map((s) => (s.id === id ? student : s));
    localStorage.setItem('fees_students', JSON.stringify(next));
    return student;
  },

  async deleteStudent(id) {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/students/${id}`, { method: 'DELETE' });
        if (res.ok) return true;
      } catch (err) {
        console.error('Error deleting student:', err);
      }
    }
    const current = JSON.parse(localStorage.getItem('fees_students') || '[]');
    localStorage.setItem('fees_students', JSON.stringify(current.filter((s) => s.id !== id)));
    return true;
  },

  // Fees Records CRUD
  async getFees() {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/fees`);
        if (res.ok) {
          const data = await res.json();
          // Map snake_case to camelCase
          return data.map((f) => ({
            id: f.id,
            studentId: f.student_id,
            batchId: f.batch_id,
            month: f.month,
            year: Number(f.year),
            amount: Number(f.amount),
            status: f.status,
            paidDate: f.paid_date,
            paymentMethod: f.payment_method,
          }));
        }
      } catch (err) {
        console.error('Error fetching fees:', err);
      }
    }
    return JSON.parse(localStorage.getItem('fees_records') || '[]');
  },

  async addFee(fee) {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/fees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: fee.studentId,
            batchId: fee.batchId,
            month: fee.month,
            year: fee.year,
            amount: fee.amount,
            status: fee.status,
            paymentMethod: fee.paymentMethod,
          }),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error('Error adding fee:', err);
      }
    }
    const current = JSON.parse(localStorage.getItem('fees_records') || '[]');
    current.push(fee);
    localStorage.setItem('fees_records', JSON.stringify(current));
    return fee;
  },

  async updateFee(id, fee) {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/fees/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: fee.status,
            paymentMethod: fee.paymentMethod,
          }),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error('Error updating fee:', err);
      }
    }
    const current = JSON.parse(localStorage.getItem('fees_records') || '[]');
    const next = current.map((f) => (f.id === id ? { ...f, ...fee } : f));
    localStorage.setItem('fees_records', JSON.stringify(next));
    return fee;
  },

  async deleteFee(id) {
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE_URL}/fees/${id}`, { method: 'DELETE' });
        if (res.ok) return true;
      } catch (err) {
        console.error('Error deleting fee:', err);
      }
    }
    const current = JSON.parse(localStorage.getItem('fees_records') || '[]');
    localStorage.setItem('fees_records', JSON.stringify(current.filter((f) => f.id !== id)));
    return true;
  },
};
