document.getElementById('save').addEventListener('click', handleSaveClick);

function handleSaveClick() {
  const data = collectFormData();
  if (!validateData(data)) return;

  updateUserSettings(data);
}

function collectFormData() {
  return {
    username: document.getElementById('username').value.trim(),
    bio: document.getElementById('bio').value.trim(),
    email: document.getElementById('email').value.trim(),
    phoneNumber: document.getElementById('phoneNumber').value.trim(),
    street: document.getElementById('street').value.trim(),
    city: document.getElementById('city').value.trim(),
    province: document.getElementById('province').value.trim(),
    postalCode: document.getElementById('postalCode').value.trim()
  };
}

function validateData(data) {
  if (!data.email) {
    alert("Email is required.");
    return false;
  }
  return true;
}

function updateUserSettings(data) {
  fetch('/api/user/account', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(res => {
    alert(res.success ? 'User info updated!' : `Update failed: ${res.error || 'Unknown error'}`);
  })
  .catch(err => {
    console.error('Error:', err);
    alert('Request failed.');
  });
}

  
  window.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user/account')
      .then(res => res.json())
      .then(user => {
        if (user.error) throw new Error(user.error);
  
        document.getElementById('email').value = user.email || '';
        document.getElementById('phoneNumber').value = user.phoneNumber || '';
        document.getElementById('street').value = user.street || '';
        document.getElementById('city').value = user.city || '';
        document.getElementById('province').value = user.province || '';
        document.getElementById('postalCode').value = user.postalCode || '';
        document.getElementById('username').value = user.username || '';
        document.getElementById('bio').value = user.bio || '';
      })
      .catch(err => {
        console.error('Failed to load user data:', err);
        alert('Could not load user information.');
      });
  });