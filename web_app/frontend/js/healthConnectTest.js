async function getData(method) {
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

async function getAllData() {
  try {
    const customDate = new Date(2024, 3, 30, 10, 30, 0); // April is month 3 (0-based)
    console.log('Custom date:', customDate);

    const response = await fetch('/api/healthConnect/getAll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lastSyncedAt: customDate,
        queries: {}
      })
    });

    const data = await response.json();
    console.log('All health data:', data);
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

async function syncAllHealthData() {
  try {
    const customDate = new Date(2024, 3, 30, 10, 30, 0); // April 30, 2024 10:30:00
    console.log("Syncing since:", customDate.toISOString());

    const response = await fetch('/api/db/syncAll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lastSyncedAt: customDate.toISOString(),
        queries: {} // optional filters
      })
    });

    const result = await response.json();
    console.log("Sync results:", result);
    return result;
  } catch (err) {
    console.error('Sync failed:', err);
    return null;
  }
}



document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');

  form.addEventListener('submit', async (e) => { // <== async here
    e.preventDefault(); // Prevent page reload

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const method = document.getElementById('method').value;

   
      let data
      if(method == "GetAll"){
        data = await getAllData();
        syncAllHealthData(); // Call your data fetcher
      }
      else{
         data = await getData(method); // Call your data fetcher

      }
      displayResults(data); // Display the results
 
  });
});
