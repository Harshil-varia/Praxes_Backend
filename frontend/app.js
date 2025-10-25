const API = 'http://localhost:3001/api';
let consultId = null;
let consultData = null;

document.addEventListener('DOMContentLoaded', () => {
  loadConsults();
  
  // wire up button handlers
  document.getElementById('load-btn').onclick = loadMessages;
  document.getElementById('send-btn').onclick = sendMsg;
  document.getElementById('consult-select').onchange = onConsultChange;
});

// grab all consultations from backend and populate dropdown
async function loadConsults() {
  const res = await fetch('http://localhost:3001/dev/data');
  const data = await res.json();
  
  const select = document.getElementById('consult-select');
  data.consultations.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.text = `${c.patient_id} + ${c.doctor_id}`;
    // store patient/doctor IDs in dataset for easy access later
    opt.dataset.patientId = c.patient_id;
    opt.dataset.doctorId = c.doctor_id;
    select.add(opt);
  });
}

function onConsultChange(e) {
  const selected = e.target.selectedOptions[0];
  if (!selected) return;
  
  consultId = selected.value;
  consultData = {
    patientId: selected.dataset.patientId,
    doctorId: selected.dataset.doctorId
  };
  
  // show the sender selection section once they pick a consultation
  document.getElementById('sender-section').style.display = 'block';
  document.getElementById('patient-id').textContent = consultData.patientId;
  document.getElementById('doctor-id').textContent = consultData.doctorId;
}

function pickSender(role) {
  const id = role === 'patient' ? consultData.patientId : consultData.doctorId;
  document.getElementById('sender-id').value = id;
  document.getElementById('sender-role').value = role;
  document.getElementById('selected-user').textContent = `Sending as: ${id} (${role})`;
}

async function loadMessages() {
  if (!consultId) {
    alert('Pick a consultation first');
    return;
  }
  
  // check if there's an active filter
  const role = document.querySelector('.filter-btn.active')?.dataset.role || '';
  const url = role ? `${API}/consultations/${consultId}/messages?role=${role}` 
                   : `${API}/consultations/${consultId}/messages`;
  
  const res = await fetch(url);
  const json = await res.json();
  
  const container = document.getElementById('messages');
  if (!json.data || json.data.length === 0) {
    container.innerHTML = '<p>No messages</p>';
    return;
  }
  
  // build message divs
  container.innerHTML = json.data.map(m => `
    <div class="msg">
      <b>${m.senderId}</b> (${m.senderRole}) - ${formatTime(m.sentAt)}
      <div>${m.messageText}</div>
    </div>
  `).join('');
}

async function sendMsg() {
  const senderId = document.getElementById('sender-id').value;
  const senderRole = document.getElementById('sender-role').value;
  const text = document.getElementById('msg-text').value.trim();
  
  if (!senderId || !text) {
    alert('Fill everything out');
    return;
  }
  
  const res = await fetch(`${API}/messages`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      consultationId: consultId,
      senderId: senderId,
      senderRole: senderRole,
      content: text
    })
  });
  
  if (res.ok) {
    document.getElementById('msg-text').value = '';
    loadMessages(); // refresh to show new message
  } else {
    const err = await res.json();
    alert('Error: ' + err.error);
  }
}

function filterMsgs(role) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  loadMessages();
}

function formatTime(ts) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric', 
    hour: '2-digit',
    minute: '2-digit'
  });
}
