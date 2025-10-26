const API = 'http://localhost:3001/api';
let consultId = null;
let consultData = null;

document.addEventListener('DOMContentLoaded', () => {
  // wire up button handlers
  document.getElementById('load-btn').onclick = loadMessages;
  document.getElementById('send-btn').onclick = sendMsg;
  document.getElementById('consult-select').onchange = onConsultChange;
  document.getElementById('copy-id-btn').onclick = copyConsultId;
  
  // load consultations when page loads (but keep hidden)
  loadConsults();
});

// toggle between create new or pick existing
function toggleMode(mode) {
  if (mode === 'create') {
    document.getElementById('create-section').style.display = 'block';
    document.getElementById('pick-section').style.display = 'none';
  } else {
    // switching to pick mode - reload consultations to get any new ones
    loadConsults();
    document.getElementById('create-section').style.display = 'none';
    document.getElementById('pick-section').style.display = 'block';
  }
  
  // hide everything else until they make a choice
  document.getElementById('current-id-section').style.display = 'none';
  document.getElementById('filter-section').style.display = 'none';
  document.getElementById('sender-section').style.display = 'none';
  document.getElementById('message-form').style.display = 'none';
  document.getElementById('messages').innerHTML = '<p>Waiting for consultation selection...</p>';
}

// create new consultation
async function createConsult() {
  const patientId = document.getElementById('new-patient-id').value.trim();
  const doctorId = document.getElementById('new-doctor-id').value.trim();
  
  if (!patientId || !doctorId) {
    alert('Enter both patient and doctor IDs');
    return;
  }
  
  const res = await fetch('http://localhost:3001/api/consultations', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ patientId, doctorId })
  });
  
  if (res.ok) {
    const json = await res.json();
    consultId = json.data.id;
    consultData = {
      patientId: json.data.patientId,
      doctorId: json.data.doctorId
    };
    
    // show the new consultation
    showConsultation();
    
    // clear the form
    document.getElementById('new-patient-id').value = '';
    document.getElementById('new-doctor-id').value = '';
    
    alert('Consultation created! ID: ' + consultId);
  } else {
    const err = await res.json();
    alert('Error: ' + err.error);
  }
}

// grab all consultations from backend and populate dropdown
async function loadConsults() {
  const res = await fetch('http://localhost:3001/dev/data');
  const data = await res.json();
  
  const select = document.getElementById('consult-select');
  // clear existing options except the first one
  select.innerHTML = '<option value="">-- Pick one --</option>';
  
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
  if (!selected || !selected.value) return;
  
  consultId = selected.value;
  consultData = {
    patientId: selected.dataset.patientId,
    doctorId: selected.dataset.doctorId
  };
  
  showConsultation();
}

// show consultation details and enable messaging
function showConsultation() {
  // show the consultation ID
  document.getElementById('current-id-section').style.display = 'block';
  document.getElementById('current-id').textContent = consultId;
  document.getElementById('copy-id-btn').style.display = 'inline-block';
  
  // show filters and sender section
  document.getElementById('filter-section').style.display = 'block';
  document.getElementById('sender-section').style.display = 'block';
  document.getElementById('message-form').style.display = 'block';
  
  document.getElementById('patient-id').textContent = consultData.patientId;
  document.getElementById('doctor-id').textContent = consultData.doctorId;
  
  // auto-load messages
  loadMessages();
}

function copyConsultId() {
  const idText = document.getElementById('current-id').textContent;
  navigator.clipboard.writeText(idText).then(() => {
    const btn = document.getElementById('copy-id-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
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
    container.innerHTML = '<p>No messages yet</p>';
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
    alert('Pick who you are and type a message');
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
