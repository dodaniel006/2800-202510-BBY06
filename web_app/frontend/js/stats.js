Chart.register(window.ChartZoom);

  let sleepChartInstance = null;

function getZoomOptions() {
  return {
    pan: {
      enabled: true,
      mode: 'x'
    },
    zoom: {
      wheel: {
        enabled: true,
        modifierKey: 'ctrl' // ✅ Only wheel zoom requires Ctrl
      },
      pinch: {
        enabled: true // ✅ Allows two-finger pinch on touch devices
      },
      mode: 'x'
    }
  };
}

  
function resetZoom(chartId) {
  const chart = Chart.getChart(chartId);
  if (chart) chart.resetZoom();
}

async function fetchData() {
  const res = await fetch('/api/db/data/steps');
  if (!res.ok) throw new Error("Failed to fetch steps data");
  return await res.json();
}

function transformData(data) {
  const bucketMinutes = 5;
  const buckets = {};
  for (const item of data) {
    const date = new Date(item.start);
    const rounded = new Date(date);
    rounded.setMinutes(Math.floor(date.getMinutes() / bucketMinutes) * bucketMinutes, 0, 0);
    const key = rounded.toISOString();
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(item.data.count);
  }

  const labels = [];
  const averagedCounts = [];
  for (const key of Object.keys(buckets).sort()) {
    const avg = buckets[key].reduce((a, b) => a + b, 0) / buckets[key].length;
labels.push(new Date(key));
    averagedCounts.push(Math.round(avg));
  }

  return {
    labels,
    datasets: [{
      label: 'Avg Activity Count',
      data: averagedCounts,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1
    }]
  };
}
async function renderChart() {
  const rawData = await fetchData();
  const chartData = transformData(rawData);
  new Chart(document.getElementById('fitnessChart').getContext('2d'), {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
  maintainAspectRatio: false, 
      animation: false,
      interaction: { mode: 'index', intersect: false, axis: 'x' },
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
        title: { display: true, text: 'Steps Over Time' },
        zoom: getZoomOptions()
      },
scales: {
  x: {
    title: {
      display: true,
      text: 'Time'
    },
    type: 'time',
    time: {
      unit: 'hour',
      displayFormats: {
        hour: 'HH:mm'
      }
    },
    ticks: {
      maxTicksLimit: 10,
      callback: function(value) {
        const date = new Date(value);
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    },
    // 👇 Default zoom to current day
    min: (() => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return now;
    })(),
    max: (() => {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      return now;
    })()
  },
  y: {
    beginAtZero: true,
    title: {
      display: true,
      text: 'Steps per 5-Minute Interval'
    }
  }
}

    }
  });
}


    renderChart();

async function fetchHeartData() {
  const res = await fetch('/api/db/data/heartRate');
  if (!res.ok) throw new Error("Failed to fetch heart rate data");
  const raw = await res.json();
  const samples = raw.flatMap(entry => entry.data.samples);
  samples.sort((a, b) => new Date(a.time) - new Date(b.time));
  const STEP = Math.ceil(samples.length / 300);
  return samples.filter((_, i) => i % STEP === 0);
}

function transformHeartRateData(samples) {
  return {
    labels: samples.map(s => new Date(s.time).toLocaleTimeString()),
    datasets: [{
      label: 'Heart Rate (BPM)',
      data: samples.map(s => s.beatsPerMinute),
      fill: false,
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.4,
      cubicInterpolationMode: 'monotone',
      pointRadius: 0.1,
      pointHitRadius: 10,
      pointHoverRadius: 4
    }]
  };
}

async function renderHeartRateChart() {
  const samples = await fetchHeartData();
  const chartData = transformHeartRateData(samples);
  new Chart(document.getElementById('heartRateChart').getContext('2d'), {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
  maintainAspectRatio: false, 
      animation: false,
      interaction: { mode: 'index', intersect: false, axis: 'x' },
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
        title: { display: true, text: 'Heart Rate (Downsampled)' },
        zoom: getZoomOptions()
      },
      scales: {
        x: { title: { display: true, text: 'Time' }, ticks: { maxTicksLimit: 10 } },
        y: { title: { display: true, text: 'Beats Per Minute' } }
      }
    }
  });
}

    renderHeartRateChart();


async function fetchCaloriesData() {
  const res = await fetch('/api/db/data/energy');
  if (!res.ok) throw new Error('Failed to fetch energy data');
  const raw = await res.json();

  // Parse JSON strings if necessary
  return raw.map(entry => {
    const energyObj = JSON.parse(entry.data.energy);
    return {
      time: new Date(entry.startTime),
      calories: energyObj.inCalories
    };
  });
}

function transformCaloriesData(data) {
  data.sort((a, b) => a.time - b.time);

  // Downsample if too dense
  const STEP = Math.ceil(data.length / 300);
  const sampled = data.filter((_, i) => i % STEP === 0);

  return {
    labels: sampled.map(d => d.time.toLocaleTimeString()),
    datasets: [{
      label: 'Calories Burned',
      data: sampled.map(d => d.calories),
      fill: true,
      backgroundColor: 'rgba(255, 206, 86, 0.4)',
      borderColor: 'rgb(255, 206, 86)',
      tension: 0.4,
      pointRadius: 0,
    }]
  };
}

async function renderCaloriesChart() {
  const raw = await fetchCaloriesData();
  console.log('📦 Raw energy data:', raw); // 👈 log raw data

  const chartData = transformCaloriesData(raw);
  console.log('📊 Transformed chart data:', chartData); // 👈 log processed chart data

  new Chart(document.getElementById('caloriesChart').getContext('2d'), {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
  maintainAspectRatio: false, 
      animation: false,
      interaction: { mode: 'index', intersect: false, axis: 'x' },
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
        title: { display: true, text: 'Calories Burned Over Time' },
        zoom: getZoomOptions()
      },
      scales: {
        x: { title: { display: true, text: 'Time' }, ticks: { maxTicksLimit: 10 } },
        y: { beginAtZero: true, title: { display: true, text: 'Calories' } }
      }
    }
  });
}

renderCaloriesChart();


async function fetchExerciseData() {
  const res = await fetch('/api/db/data/exercise'); // update if endpoint is different
  if (!res.ok) throw new Error('Failed to fetch exercise data');
  const raw = await res.json();

  return raw.map(entry => {
    const parsedData = typeof entry.data === 'string' ? JSON.parse(entry.data) : entry.data;
    return {
      title: parsedData.title || 'Untitled Exercise',
      start: new Date(entry.start),
      end: new Date(entry.end)
    };
  });
}

function transformExerciseData(sessions) {
  return {
    labels: ['Sessions'],
    datasets: sessions.map((s, index) => ({
      label: s.title,
      data: [{
        x: [s.start, s.end],
        y: 'Sessions'
      }],
      backgroundColor: `hsl(${index * 30 % 360}, 60%, 60%)`,
      borderSkipped: false,
      borderRadius: 3
    }))
  };
}

async function renderExerciseChart() {
  const sessions = await fetchExerciseData();
  console.log('📦 Raw Exercise Sessions:', sessions); // Log raw sessions

  const chartData = transformExerciseData(sessions);
  console.log('📊 Transformed Chart Data:', chartData); // Log data passed to Chart.js

  new Chart(document.getElementById('exerciseChart').getContext('2d'), {
    type: 'bar',
    data: chartData,
    options: {
      indexAxis: 'y',
      responsive: true,
  maintainAspectRatio: false, 
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const range = context.raw.x;
              return `${context.dataset.label}: ${new Date(range[0]).toLocaleTimeString()} - ${new Date(range[1]).toLocaleTimeString()}`;
            }
          }
        },
        title: {
          display: true,
          text: 'Exercise Sessions Over Time'
        },
        zoom: getZoomOptions()
      },
      parsing: false,
      scales: {
        x: {
          type: 'time',
          time: {
            displayFormats: { minute: 'h:mm a' }
          },
          title: { display: true, text: 'Time' }
        },
        y: { title: { display: false } }
      }
    }
  });
}

renderExerciseChart();

async function fetchSpeedData() {
  const res = await fetch('/api/db/data/speed');
  if (!res.ok) throw new Error('Failed to fetch speed data');
  const raw = await res.json();

  // ✅ Keep only most recent 3 entries (adjust if needed)
  const trimmed = raw.slice(-3);

  const parsed = [];

  for (const entry of trimmed) {
    try {
      const samplesArray = Array.isArray(entry.data.samples)
        ? entry.data.samples
        : JSON.parse(entry.data.samples);

      for (const rawSample of samplesArray) {
        const sample = typeof rawSample === 'string'
          ? JSON.parse(rawSample)
          : rawSample;

        const speed = typeof sample.speed === 'string'
          ? JSON.parse(sample.speed)
          : sample.speed;

        parsed.push({
          time: new Date(sample.time),
          kmh: speed.inKilometersPerHour,
          mph: speed.inMilesPerHour
        });
      }
    } catch (e) {
      console.error('❌ Failed to parse entry:', entry, e);
    }
  }

  return parsed;
}


function transformSpeedData(samples) {
  samples.sort((a, b) => a.time - b.time);

  // Downsample if needed
  const STEP = Math.ceil(samples.length / 300);
  const filtered = samples.filter((_, i) => i % STEP === 0);

  const result = {
labels: filtered.map(s => s.time),
    datasets: [{
      label: 'Speed (km/h)',
      data: filtered.map(s => s.kmh),
      fill: false,
      borderColor: 'rgb(54, 162, 235)',
      tension: 0.4,
      pointRadius: 0.1,
    }]
  };

  console.log('📊 Transformed Speed Data:', result);
  return result;
}

async function renderSpeedChart() {
  const samples = await fetchSpeedData();
  const chartData = transformSpeedData(samples);

  new Chart(document.getElementById('speedChart').getContext('2d'), {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
  maintainAspectRatio: false, 
      animation: false,
      interaction: {
        mode: 'index',
        intersect: false,
        axis: 'x'
      },
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
        title: {
          display: true,
          text: 'Speed Over Time (km/h)'
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x'
          },
          zoom: {
            wheel: {
              enabled: true,
              modifierKey: 'ctrl' // Zoom only when Ctrl is pressed
            },
            pinch: {
              enabled: true
            },
            mode: 'x'
          }
        }
      },
     scales: {
  x: {
    type: 'time', // <-- enables time-based zoom
    time: {
      tooltipFormat: 'HH:mm:ss',
      unit: 'minute',
      displayFormats: {
        minute: 'HH:mm'
      }
    },
    title: { display: true, text: 'Time' },
    ticks: { maxTicksLimit: 10 }
  },
  y: {
    beginAtZero: true,
    title: { display: true, text: 'Speed (km/h)' }
  }
}

    }
  });
}

renderSpeedChart();


async function fetchWeightData() {
  const res = await fetch('/api/db/data/weight'); // adjust endpoint as needed
  if (!res.ok) throw new Error('Failed to fetch weight data');
  const raw = await res.json();

  const parsed = [];

  for (const entry of raw) {
    try {
      const weightObj = typeof entry.data.weight === 'string'
        ? JSON.parse(entry.data.weight)
        : entry.data.weight;

      parsed.push({
        time: new Date(entry.start),
        kg: weightObj.inKilograms,
        lb: weightObj.inPounds
      });
    } catch (e) {
      console.error('❌ Failed to parse weight entry:', entry, e);
    }
  }

  console.log('📦 Raw Weight Records:', parsed);
  return parsed;
}

function transformWeightData(data) {
  data.sort((a, b) => a.time - b.time);

  const result = {
    labels: data.map(d => d.time.toLocaleDateString() + ' ' + d.time.toLocaleTimeString()),
    datasets: [{
      label: 'Weight (kg)',
      data: data.map(d => d.kg),
      borderColor: 'rgb(153, 102, 255)',
      fill: false,
      tension: 0.4,
      pointRadius: 5
    }]
  };

  console.log('📊 Transformed Weight Data:', result);
  return result;
}

async function renderWeightChart() {
  const weightData = await fetchWeightData();
  const chartData = transformWeightData(weightData);

  new Chart(document.getElementById('weightChart').getContext('2d'), {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
  maintainAspectRatio: false, 
      animation: false,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
        title: { display: true, text: 'Weight Over Time (kg)' },
        zoom: getZoomOptions()
      },
      scales: {
        x: {
          title: { display: true, text: 'Date' },
          ticks: { maxTicksLimit: 10 }
        },
        y: {
          beginAtZero: false,
          title: { display: true, text: 'Weight (kg)' }
        }
      }
    }
  });
}

renderWeightChart();


async function fetchDistanceData() {
  const res = await fetch('/api/db/data/distance'); // adjust route as needed
  if (!res.ok) throw new Error('Failed to fetch distance data');
  const raw = await res.json();

  const parsed = [];

  for (const entry of raw) {
    try {
      const distanceObj = typeof entry.data.distance === 'string'
        ? JSON.parse(entry.data.distance)
        : entry.data.distance;

      parsed.push({
        time: new Date(entry.start),
        meters: distanceObj.inMeters,
        km: distanceObj.inKilometers,
        miles: distanceObj.inMiles
      });
    } catch (e) {
      console.error('❌ Failed to parse distance entry:', entry, e);
    }
  }

  console.log('📦 Raw Distance Records:', parsed);
  return parsed;
}

function transformDistanceData(data) {
  data.sort((a, b) => a.time - b.time);

  // ⬇️ Downsample if dataset is large
  const STEP = Math.ceil(data.length / 300);
  const sampled = data.filter((_, i) => i % STEP === 0);

  const result = {
    labels: sampled.map(d => d.time.toLocaleTimeString()),
    datasets: [{
      label: 'Distance (m)',
      data: sampled.map(d => d.meters),
      borderColor: 'rgb(255, 159, 64)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      fill: true,
      tension: 0.4,
      pointRadius: 2
    }]
  };

  console.log('📊 Transformed Distance Data (Downsampled):', result);
  return result;
}

async function renderDistanceChart() {
  const distanceData = await fetchDistanceData();
  const chartData = transformDistanceData(distanceData);

  new Chart(document.getElementById('distanceChart').getContext('2d'), {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
  maintainAspectRatio: false, 
      animation: false,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
        title: { display: true, text: 'Distance Over Time (meters)' },
        zoom: getZoomOptions()
      },
      scales: {
        x: {
          title: { display: true, text: 'Time' },
          ticks: { maxTicksLimit: 10 }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Distance (m)' }
        }
      }
    }
  });
}

renderDistanceChart();

