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

        document.getElementById('ConnectButton').innerHTML = user.isHealthAppLinked ? "Connected" : "Connect Health Companion";
        document.getElementById('ConnectButton').classList.add(user.isHealthAppLinked ? "btn-success" : "btn-danger") 

      })
      .catch(err => {
        console.error('Failed to load user data:', err);
        alert('Could not load user information.');
      });
  });


async function loadHealthStats(selectedDate = null) {
  try {
    const date = selectedDate || new Date().toISOString().split('T')[0];

const [stepsRes, heartRes, speedRes, weightRes, distanceRes, sleepRes] = await Promise.all([
  fetch('/api/db/data/steps'),
  fetch('/api/db/data/heartRate'),
  fetch('/api/db/data/speed'),
  fetch('/api/db/data/weight'),
  fetch('/api/db/data/distance'),
  fetch('/api/db/data/sleepsessions') // 💤 Add sleep
]);

const [steps, heartRate, speed, weight, distance, sleep] = await Promise.all([
  stepsRes.json(),
  heartRes.json(),
  speedRes.json(),
  weightRes.json(),
  distanceRes.json(),
  sleepRes.json()
]);


    const isSameDay = (datetime) => new Date(datetime).toISOString().split('T')[0] === date;

    // Steps
    const stepCount = steps.filter(s => isSameDay(s.start))
                           .reduce((sum, s) => sum + (s.data?.count || 0), 0);
    document.getElementById('totalSteps').textContent = `Steps: ${stepCount}`;

    // Heart Rate
    const heartSamples = heartRate.flatMap(h => h.data.samples || [])
                                  .filter(s => isSameDay(s.time));
    const avgHR = Math.round(heartSamples.reduce((sum, s) => sum + s.beatsPerMinute, 0) / heartSamples.length);
    document.getElementById('avgHeartRate').textContent = `Avg HR: ${isNaN(avgHR) ? '--' : avgHR} bpm`;

    // Speed
    const allSpeeds = [];
    speed.forEach(s => {
      try {
        const samples = Array.isArray(s.data.samples) ? s.data.samples : JSON.parse(s.data.samples);
        samples.forEach(sample => {
          const parsed = typeof sample === 'string' ? JSON.parse(sample) : sample;
          const spd = typeof parsed.speed === 'string' ? JSON.parse(parsed.speed) : parsed.speed;
          if (isSameDay(parsed.time)) allSpeeds.push(spd.inKilometersPerHour);
        });
      } catch {}
    });
    const avgSpeed = (allSpeeds.reduce((a, b) => a + b, 0) / allSpeeds.length).toFixed(1);
    document.getElementById('avgSpeed').textContent = `Avg Speed: ${isNaN(avgSpeed) ? '--' : avgSpeed} km/h`;

// Sleep Duration Calculation
const selectedDateObj = new Date(date);
const sleepOnDate = sleep.find(s => {
  const sleepDate = new Date(s.start);
  return sleepDate.toISOString().split('T')[0] === date;
});

let totalSleepMinutes = 0;
if (sleepOnDate) {
  try {
    const parsedStages = typeof sleepOnDate.data.stages === 'string'
      ? JSON.parse(sleepOnDate.data.stages)
      : sleepOnDate.data.stages;

    const segments = parsedStages.map(s => typeof s === 'string' ? JSON.parse(s) : s);
    for (const seg of segments) {
      const start = new Date(seg.startTime);
      const end = new Date(seg.endTime);
      totalSleepMinutes += (end - start) / 60000; // convert ms to minutes
    }
  } catch (e) {
    console.warn("Failed to parse sleep data", e);
  }
}

const hours = Math.floor(totalSleepMinutes / 60);
const minutes = Math.round(totalSleepMinutes % 60);
const sleepText = totalSleepMinutes ? `${hours}h ${minutes}m` : '--';

document.getElementById('sleepDuration').textContent = `Total Sleep: ${sleepText}`;


    // Weight (latest by timestamp)
// Sort all weights by date descending
const sortedWeights = weight
  .map(w => ({ ...w, parsedDate: new Date(w.start) }))
  .sort((a, b) => b.parsedDate - a.parsedDate);

// Find the most recent weight entry on or before the selected date
const selectedDateTime = new Date(date + 'T23:59:59');

const weightEntry = sortedWeights.find(w => w.parsedDate <= selectedDateTime);

const latestWeight = weightEntry?.data?.weight?.inKilograms ?? '--';
document.getElementById('latestWeight').textContent = `Weight: ${latestWeight} kg`;


    // Distance
    const totalDist = distance.filter(d => isSameDay(d.start))
                              .reduce((sum, d) => sum + (d.data?.distance?.inMeters || 0), 0);
    document.getElementById('totalDistance').textContent = `Distance: ${Math.round(totalDist)} m`;

  } catch (err) {
    console.error('⚠️ Error loading health stats:', err);
  }
}


window.addEventListener('DOMContentLoaded', () => {
  // Init with today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('healthDatePicker').value = today;
  loadHealthStats(today);

  flatpickr("#healthDatePicker", {
    dateFormat: "Y-m-d",
    defaultDate: today,
    onChange: function([selected]) {
      if (selected) {
        const selectedDate = selected.toISOString().split('T')[0];
        loadHealthStats(selectedDate);
      }
    }
  });

  // ... other fetch logic for account info
});

document.getElementById('cancel').addEventListener('click', () => {
  window.location.reload();
});
