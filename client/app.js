const API_BASE = 'http://localhost:3000/api';

let conversationHistory = [];
let currentGroup = null;
let currentSession = null;
let currentBooking = null;
let userProfile = null;
let intakeStep = 0;
let intakeComplete = false;

const intakeSteps = ['concern', 'context', 'goals', 'challenges', 'preferences'];

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
  window.scrollTo(0, 0);
}

function startAIChat() {
  showScreen('consent');
}

function toggleConsentButton() {
  const checkbox = document.getElementById('consent-checkbox');
  const button = document.getElementById('consent-button');
  button.disabled = !checkbox.checked;
}

function proceedToChat() {
  if (!document.getElementById('consent-checkbox').checked) return;
  showScreen('chat');
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  input.value = '';
  
  addMessage(message, 'user');
  conversationHistory.push({ role: 'user', content: message });
  
  updateIntakeProgress();
  
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory })
    });
    
    const data = await response.json();
    
    addMessage(data.response, 'bot');
    conversationHistory.push({ role: 'assistant', content: data.response });
    
    if (intakeStep >= 4 && !intakeComplete) {
      await generateProfile();
    }
  } catch (error) {
    console.error('Chat error:', error);
    addMessage('Sorry, I encountered an error. Please try again.', 'bot');
  }
}

function addMessage(content, type) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const paragraphs = content.split('\n').filter(p => p.trim());
  messageDiv.innerHTML = `<div class="message-content">${paragraphs.map(p => `<p>${p}</p>`).join('')}</div>`;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleChatKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function updateIntakeProgress() {
  intakeStep = Math.min(intakeStep + 1, 4);
  
  document.querySelectorAll('.progress-step').forEach((step, index) => {
    step.classList.remove('active', 'completed');
    
    if (index < intakeStep) {
      step.classList.add('completed');
    } else if (index === intakeStep) {
      step.classList.add('active');
    }
  });
}

async function generateProfile() {
  if (intakeComplete) return;
  intakeComplete = true;
  
  try {
    const response = await fetch(`${API_BASE}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationHistory })
    });
    
    userProfile = await response.json();
    
    if (userProfile.recommendedGroup) {
      document.getElementById('book-recommended-btn').style.display = 'block';
      document.getElementById('book-recommended-btn').textContent = `Book: ${userProfile.recommendedGroup.name}`;
    }
    
    updateProfileDisplay();
  } catch (error) {
    console.error('Profile generation error:', error);
  }
}

function updateProfileDisplay() {
  if (!userProfile) return;
  
  const themesContainer = document.getElementById('profile-themes');
  themesContainer.innerHTML = (userProfile.themes || []).map(theme => 
    `<span class="pill">${theme}</span>`
  ).join('');
  
  document.getElementById('profile-concern').textContent = userProfile.mainConcern || 'Not specified';
  
  const goalsContainer = document.getElementById('profile-goals');
  goalsContainer.innerHTML = (userProfile.goals || []).map(goal => `<li>${goal}</li>`).join('');
  
  const challengesContainer = document.getElementById('profile-challenges');
  challengesContainer.innerHTML = (userProfile.challenges || []).map(challenge => `<li>${challenge}</li>`).join('');
  
  document.getElementById('profile-format').textContent = userProfile.preferences?.format || 'Not specified';
  document.getElementById('profile-timing').textContent = userProfile.preferences?.timing || 'Not specified';
  
  if (userProfile.recommendedGroups && Array.isArray(userProfile.recommendedGroups)) {
    const groupsContainer = document.getElementById('recommended-groups-container');
    if (groupsContainer) {
      groupsContainer.innerHTML = userProfile.recommendedGroups.map(group => `
        <div class="recommended-group-card ${group.relevanceScore >= 8 ? 'high-relevance' : ''}">
          <div class="group-header">
            <h4>${group.groupName}</h4>
            <span class="relevance-badge">Relevance: ${group.relevanceScore}/10</span>
          </div>
          <p class="group-reasoning">${group.reasoning}</p>
          <button class="cta-button primary" onclick="viewGroup('${group.groupId}')">
            Book This Group
          </button>
        </div>
      `).join('');
    }
  }
}

function bookRecommendedGroup() {
  if (userProfile?.recommendedGroup) {
    viewGroup(userProfile.recommendedGroup.id);
  }
}

async function viewGroup(groupId) {
  try {
    const response = await fetch(`${API_BASE}/groups/${groupId}`);
    currentGroup = await response.json();
    
    document.getElementById('sessions-group-name').textContent = currentGroup.name;
    
    const sessionsList = document.getElementById('sessions-list');
    sessionsList.innerHTML = currentGroup.sessions.map(session => {
      const availableSeats = currentGroup.capacity - session.bookedSeats;
      const isFull = availableSeats === 0;
      
      return `
        <div class="session-card">
          <div class="session-info">
            <div class="session-date">${formatDate(session.date)}</div>
            <div class="session-time">${formatTime(session.time)} (${session.duration} min)</div>
            <div class="session-therapist">👨‍⚕️ ${session.therapist}</div>
          </div>
          <div class="session-seats">
            <div class="seats-number">${availableSeats}</div>
            <div class="seats-label">seats left</div>
          </div>
          <button 
            class="cta-button ${isFull ? '' : 'primary'}" 
            onclick="${isFull ? '' : `selectSession('${session.id}')`}"
            ${isFull ? 'disabled' : ''}
          >
            ${isFull ? 'Fully Booked' : 'Book Seat'}
          </button>
        </div>
      `;
    }).join('');
    
    showScreen('sessions');
  } catch (error) {
    console.error('View group error:', error);
  }
}

function selectSession(sessionId) {
  currentSession = currentGroup.sessions.find(s => s.id === sessionId);
  
  document.getElementById('booking-group-name').textContent = currentGroup.name;
  document.getElementById('booking-date').textContent = formatDate(currentSession.date);
  document.getElementById('booking-time').textContent = formatTime(currentSession.time);
  document.getElementById('booking-therapist').textContent = currentSession.therapist;
  
  showScreen('booking');
}

async function confirmBooking() {
  const name = document.getElementById('booking-name').value.trim();
  const email = document.getElementById('booking-email').value.trim();
  
  if (!name || !email) {
    alert('Please fill in all required fields');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: currentGroup.id,
        sessionId: currentSession.id,
        userName: name,
        userEmail: email
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentBooking = data.booking;
      showScreen('payment');
    } else {
      alert(data.error || 'Booking failed');
    }
  } catch (error) {
    console.error('Booking error:', error);
    alert('Failed to create booking');
  }
}

function processPayment() {
  document.getElementById('confirmation-id').textContent = currentBooking.id;
  document.getElementById('confirmation-group').textContent = currentBooking.groupName;
  document.getElementById('confirmation-date').textContent = formatDate(currentBooking.sessionDate);
  document.getElementById('confirmation-time').textContent = formatTime(currentBooking.sessionTime);
  document.getElementById('confirmation-therapist').textContent = currentBooking.therapist;
  
  showScreen('confirmation');
}

async function generateHandoff() {
  try {
    const response = await fetch(`${API_BASE}/handoff/${currentBooking.groupId}`);
    const data = await response.json();
    
    document.getElementById('handoff-theme').textContent = data.handoff.groupTheme;
    
    const goalsContainer = document.getElementById('handoff-goals');
    goalsContainer.innerHTML = data.handoff.sharedGoals.map(goal => `<li>${goal}</li>`).join('');
    
    const participantsContainer = document.getElementById('handoff-participants');
    participantsContainer.innerHTML = data.participants.map(p => `
      <div class="participant-card">
        <h4>${p.name}</h4>
        <p>${p.keyPoints ? p.keyPoints.join(', ') : p.concern}</p>
      </div>
    `).join('');
    
    const focusContainer = document.getElementById('handoff-focus');
    focusContainer.innerHTML = data.handoff.suggestedFocusAreas.map(area => `<li>${area}</li>`).join('');
    
    document.getElementById('handoff-notes').textContent = data.handoff.therapistNotes;
    
    window.currentHandoffData = data;
    
    showScreen('handoff');
  } catch (error) {
    console.error('Handoff generation error:', error);
    alert('Failed to generate handoff');
  }
}

function downloadHandoffJSON() {
  if (!window.currentHandoffData) return;
  
  const dataStr = JSON.stringify(window.currentHandoffData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `mentra-handoff-${window.currentHandoffData.groupId}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadHandoffPDF() {
  if (!window.currentHandoffData) return;
  
  const handoff = window.currentHandoffData.handoff;
  const participants = window.currentHandoffData.participants;
  
  const pdfContent = `
MENTRA THERAPIST HANDOFF REPORT
================================
Generated: ${new Date().toISOString()}

GROUP THEME
-----------
${handoff.groupTheme}

SHARED GOALS
------------
${handoff.sharedGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

PARTICIPANT SUMMARIES
---------------------
${participants.map((p, i) => `
Participant ${i + 1}: ${p.name}
${p.keyPoints ? p.keyPoints.map(kp => `- ${kp}`).join('\n') : `- ${p.concern}`}
`).join('\n')}

SUGGESTED FOCUS AREAS
----------------------
${handoff.suggestedFocusAreas.map((f, i) => `${i + 1}. ${f}`).join('\n')}

THERAPIST ENGAGEMENT NOTES
--------------------------
${handoff.therapistNotes}

---
This is a demo report for educational purposes only.
  `.trim();
  
  const blob = new Blob([pdfContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `mentra-handoff-${window.currentHandoffData.groupId}-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

document.addEventListener('DOMContentLoaded', () => {
  showScreen('landing');
});
