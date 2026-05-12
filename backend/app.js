const BASE = 'http://localhost:5000/api';

// ── snake_case → camelCase normalizers ──────────────────────────────────────

function normalizeBatch(b) {
  if (!b) return b;
  return {
    id:         b.id,
    name:       b.name,
    subject:    b.subject,
    schedule:   b.schedule,
    monthlyFee: b.monthly_fee ?? b.monthlyFee ?? 0,
    createdAt:  b.created_at ?? b.createdAt ?? null,
  };
}

function normalizeStudent(s) {
  if (!s) return s;
  return {
    id:       s.id,
    name:     s.name,
    mobile:   s.mobile,
    email:    s.email   ?? '',
    address:  s.address ?? '',
    batchId:  s.batch_id ?? s.batchId ?? '',
    joinDate: s.join_date ?? s.joinDate ?? new Date().toISOString(),
  };
}

function normalizeFee(f) {
  if (!f) return f;
  return {
    id:            f.id,
    studentId:     f.student_id    ?? f.studentId,
    batchId:       f.batch_id      ?? f.batchId,
    month:         f.month,
    year:          f.year,
    amount:        f.amount,
    status:        f.status,
    paidDate:      f.paid_date     ?? f.paidDate     ?? null,
    paymentMethod: f.payment_method ?? f.paymentMethod ?? null,
  };
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status}`);
  }
  return json;
}

// ── auth ─────────────────────────────────────────────────────────────────────

async function login(role, credentials) {
  try {
    const body = role === 'teacher'
      ? { role, password: credentials.password }
      : { role, mobile: credentials.mobile };

    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      success: true,
      auth: { role: data.role, userId: data.userId },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── batches ──────────────────────────────────────────────────────────────────

async function getBatches() {
  const data = await request('/batches');
  return data.map(normalizeBatch);
}

async function addBatch(batch) {
  const data = await request('/batches', {
    method: 'POST',
    body: JSON.stringify({
      name:       batch.name,
      subject:    batch.subject,
      schedule:   batch.schedule,
      monthlyFee: batch.monthlyFee,
    }),
  });
  return normalizeBatch(data);
}

async function updateBatch(id, batch) {
  const data = await request(`/batches/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name:       batch.name,
      subject:    batch.subject,
      schedule:   batch.schedule,
      monthlyFee: batch.monthlyFee,
    }),
  });
  return normalizeBatch(data);
}

async function deleteBatch(id) {
  return request(`/batches/${id}`, { method: 'DELETE' });
}

// ── students ─────────────────────────────────────────────────────────────────

async function getStudents() {
  const data = await request('/students');
  return data.map(normalizeStudent);
}

async function addStudent(student) {
  const data = await request('/students', {
    method: 'POST',
    body: JSON.stringify({
      name:    student.name,
      mobile:  student.mobile,
      email:   student.email,
      address: student.address,
      batchId: student.batchId,
    }),
  });
  return normalizeStudent(data);
}

async function updateStudent(id, student) {
  const data = await request(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name:    student.name,
      mobile:  student.mobile,
      email:   student.email,
      address: student.address,
      batchId: student.batchId,
    }),
  });
  return normalizeStudent(data);
}

async function deleteStudent(id) {
  return request(`/students/${id}`, { method: 'DELETE' });
}

// ── fees ─────────────────────────────────────────────────────────────────────

async function getFees() {
  const data = await request('/fees');
  return data.map(normalizeFee);
}

async function addFee(fee) {
  const data = await request('/fees', {
    method: 'POST',
    body: JSON.stringify({
      studentId:     fee.studentId,
      batchId:       fee.batchId,
      month:         fee.month,
      year:          fee.year,
      amount:        fee.amount,
      status:        fee.status,
      paymentMethod: fee.paymentMethod,
    }),
  });
  return normalizeFee(data);
}

async function updateFee(id, fee) {
  const data = await request(`/fees/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      status:        fee.status,
      paymentMethod: fee.paymentMethod,
    }),
  });
  return normalizeFee(data);
}

async function deleteFee(id) {
  return request(`/fees/${id}`, { method: 'DELETE' });
}

// ── exports ───────────────────────────────────────────────────────────────────

export const api = {
  login,
  getBatches,  addBatch,    updateBatch,  deleteBatch,
  getStudents, addStudent,  updateStudent, deleteStudent,
  getFees,     addFee,      updateFee,    deleteFee,
};