
  document.getElementById('editPublicInfo').addEventListener('click', () => {
    const fields = document.querySelectorAll('.publicInfoField');
    const isDisabled = fields[0].disabled;
  
    fields.forEach(field => field.disabled = !isDisabled);
    if (!isDisabled) updatePublicData();
  });

  document.getElementById('editPrivateInfo').addEventListener('click', () => {
    const fields = document.querySelectorAll('.privateInfoField');
    const isDisabled = fields[0].disabled;
  
    fields.forEach(field => field.disabled = !isDisabled);
    if (!isDisabled) updatePrivateData();
  });
  
  function updatePublicData() {
    const username = document.getElementById('username').value.trim();
    const bio = document.getElementById('bio').value.trim();
  
    fetch('api/db/user/public', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, bio })
    })
    .then(res => res.json())
    .then(res => {
      alert(res.success ? 'Public info updated!' : `Update failed: ${res.error || 'Unknown error'}`);
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Request failed.');
    });
  }
  
  function updatePrivateData() {
    const email = document.getElementById('email').value.trim();
    if (!email) {
      alert("Email is required.");
      return;
    }
  
    const data = {
      email,
      phoneNumber: document.getElementById('phoneNumber').value.trim(),
      street: document.getElementById('street').value.trim(),
      city: document.getElementById('city').value.trim(),
      province: document.getElementById('province').value.trim(),
      postalCode: document.getElementById('postalCode').value.trim()
    };
  
    fetch('api/db/user/private', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
      alert(res.success ? 'Private info updated!' : `Update failed: ${res.error || 'Unknown error'}`);
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Request failed.');
    });
  }
  
  
  window.addEventListener('DOMContentLoaded', () => {
    fetch('/api/db/user')
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