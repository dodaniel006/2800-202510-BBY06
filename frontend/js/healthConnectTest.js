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
    const response = await fetch(`/api/healthConnect/get/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accessToken: token,
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


function displayResults(array) {
  const container = document.getElementById('results-container');
  container.innerHTML = ""; // Clear existing

  if (!Array.isArray(array)) {
    container.innerText = 'Expected an array but got:\n' + JSON.stringify(array, null, 2);
    console.error('displayResults expected array, got:', array);
    return;
  }

  array.forEach(item => {
    const div = document.createElement('div');
    div.style.marginBottom = '1em';

    div.innerHTML = `
      <strong>App:</strong> ${item.app} <br>
      <strong>Count:</strong> ${item.data?.count ?? 'N/A'} <br>
      <strong>Start:</strong> ${item.start} <br>
      <strong>End:</strong> ${item.end} <br>
      <hr>
    `;

    container.appendChild(div);
  });
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
