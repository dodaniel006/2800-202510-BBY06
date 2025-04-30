async function login(username, password) {
  try {
    const response = await fetch('/api/healthConnect/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Login response:', data);
    return data.token; // or data.access_token, depending on what your backend returns
  } catch (error) {
    console.error('Login request failed:', error);
    return null;
  }
}


async function getData(token, method) {
  try {
    let date = new Date();
    const customDate = new Date(2024, 3, 30, 10, 30, 0);
    console.log('Current date:' + customDate);

    const response = await fetch(`/api/healthConnect/get/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accessToken: token,
        lastSyncedAt: customDate,
        queries: {}
      })
    });

    const data = await response.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}


function displayResults(data) {
  const container = document.getElementById('results-container');
  container.innerHTML = ""; // Clear existing

  const renderObject = (obj, indent = 0) => {
    const pad = '&nbsp;'.repeat(indent * 2);
    let html = '';

    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        html += `${pad}<strong>${key}:</strong><br>${renderObject(value, indent + 1)}`;
      } else {
        html += `${pad}<strong>${key}:</strong> ${value}<br>`;
      }
    }

    return html;
  };

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const div = document.createElement('div');
      div.style.marginBottom = '1em';
      div.innerHTML = `<strong>Item ${index + 1}:</strong><br>` + renderObject(item) + `<hr>`;
      container.appendChild(div);
    });
  } else if (typeof data === 'object' && data !== null) {
    const div = document.createElement('div');
    div.innerHTML = renderObject(data);
    container.appendChild(div);
  } else {
    container.innerText = String(data);
  }
}




document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');

  form.addEventListener('submit', async (e) => { // <== async here
    e.preventDefault(); // Prevent page reload

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const method = document.getElementById('method').value;

    const token = await login(username, password); // await is now valid
    console.log('Token:', token); // Log the token for debugging
    if (token) {
      let data = await getData(token, method); // Call your data fetcher
      displayResults(data); // Display the results
    } else {
      console.error('Login failed — no token received');
    }
  });
});
