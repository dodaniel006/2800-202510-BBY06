Chart.register(window.ChartZoom);

  let sleepChartInstance = null;

function getZoomOptions(min, max) {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    pan: {
      enabled: true,
      mode: 'x',
      limits: {
        x: { min, max, minRange: 60 * 60 * 1000 } // 1 hour
      }
    },
    zoom: {
      wheel: {
        enabled: !isTouchDevice, // ⛔️ disable scroll zoom on touch devices
        modifierKey: 'ctrl'       // ✅ allow ctrl+scroll on PC
      },
      pinch: {
        enabled: true             // ✅ always allow pinch zoom
      },
      mode: 'x',
      limits: {
        x: { min, max, minRange: 60 * 60 * 1000 }
      }
    }
  };
}




  
function resetZoom(chartId) {
  const chart = Chart.getChart(chartId);
  if (chart) chart.resetZoom();
}

async function fetchData(selectedDate) {
  const res = await fetch('/api/db/data/steps');
  if (!res.ok) throw new Error("Failed to fetch steps data");

  const all = await res.json();
  if (!selectedDate) return [];

  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  return all.filter(item => {
    const t = new Date(item.start);
    return t >= dayStart && t <= dayEnd;
  });
}

async function fetchAvailableStepDates() {
  const res = await fetch('/api/db/data/steps');
  if (!res.ok) throw new Error("Failed to fetch steps data");

  const all = await res.json();
  const dates = Array.from(new Set(
    all.map(item => new Date(item.start).toISOString().split('T')[0])
  ));

  const latest = dates.sort().at(-1);
  document.getElementById('stepsDatePicker').value = latest;

  flatpickr("#stepsDatePicker", {
    dateFormat: "Y-m-d",
    enable: dates,
    defaultDate: latest,
    onChange: function(selectedDates) {
      if (selectedDates.length > 0) {
        const selectedDate = selectedDates[0].toISOString().split("T")[0];
        renderChart(selectedDate);
      }
    }
  });

  renderChart(latest);
}

fetchAvailableStepDates();


function transformData(data) {
  const bucketMinutes = 15;
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
let stepsChartInstance = null;

async function renderChart(date) {
  const rawData = await fetchData(date);
  const chartData = transformData(rawData);

  const min = new Date(date); min.setHours(0, 0, 0, 0);
  const max = new Date(date); max.setHours(23, 59, 59, 999);
  const totalSteps = chartData.datasets[0].data.reduce((a, b) => a + b, 0);

  // 🟢 Show total in UI
  document.getElementById('totalSteps').innerText = `Total Steps: ${totalSteps}`;

  if (stepsChartInstance) stepsChartInstance.destroy();

  stepsChartInstance = new Chart(document.getElementById('fitnessChart').getContext('2d'), {
    type: 'bar',
    data: chartData,
    options: {
      clip: true,
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false, axis: 'x' },
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
        zoom: getZoomOptions(min.getTime(), max.getTime())
      },
      scales: {
        x: {
          type: 'time',
          min,
          max,
          time: {
            unit: 'hour',
            displayFormats: { hour: 'HH:mm' }
          },
          ticks: {
            maxTicksLimit: 10,
            callback: function(value) {
              const d = new Date(value);
              return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            }
          },
          title: { display: true, text: 'Time' },
          grace: '0%'
        },
        y: {
          beginAtZero: true,
          suggestedMax: 300,
          title: { display: true, text: 'Steps per 15-Minute Interval' }
        }
      }
    }
  });
}





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
  interaction: {
    mode: 'index',
    intersect: false,
    axis: 'x'
  },
  plugins: {
    legend: { display: true },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function(ctx) {
          const kg = ctx.raw;
          const lb = (kg * 2.20462).toFixed(1);
          return `Weight: ${kg} kg (${lb} lb)`;
        },
        title: function(tooltipItems) {
          return `Time: ${tooltipItems[0].label}`;
        }
      }
    },
    title: {
      display: true,
      text: 'Weight Over Time (kg)'
    },
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
  interaction: {
    mode: 'index',
    intersect: false,
    axis: 'x'
  },
  plugins: {
    legend: { display: true },
    tooltip: {
      enabled: true,
      callbacks: {
label: function(ctx) {
  const kg = ctx.raw.toFixed(1);
  const lb = (ctx.raw * 2.20462).toFixed(1);
  return `Weight: ${kg} kg (${lb} lb)`;
},
        title: function(tooltipItems) {
          return `Time: ${tooltipItems[0].label}`;
        }
      }
    },
    title: {
      display: true,
      text: 'Weight Over Time (kg)'
    },
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

renderDistanceChart();


let sleepSegments = [];

function timeToFractionOfDay(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  return (h * 3600 + m * 60 + s) / 86400; // 86400 = seconds in day
}

function createSleepSegments(stages) {
  const arcSegments = [];

  stages.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  let last = null;

  for (const s of stages) {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);

    const startFrac = timeToFractionOfDay(start);
    const endFrac = timeToFractionOfDay(end);
    let duration = endFrac - startFrac;
    if (duration < 0) duration += 1;

    if (last && last.label === s.stage) {
      // merge duration
      last.endTime = end;
      last.value += duration * 100;
    } else {
      // new arc segment
      last = {
        label: s.stage,
        value: duration * 100,
        backgroundColor: getStageColor2(s.stage),
        startTime: start,
        endTime: end
      };
      arcSegments.push(last);
    }
  }

  return arcSegments;
}



function getStageColor2(stage) {
  const map = {
    1: '#f39c12', // Awake
    4: '#3498db', // Light
    5: '#9b59b6', // REM
    6: '#2ecc71'  // Deep
  };
  return map[stage] ?? '#95a5a6';
}

async function fetchSleepClockData(selectedDate = null) {
  const res = await fetch('/api/db/data/sleepsessions');
  if (!res.ok) throw new Error('Failed to fetch sleep data');

  const sessions = await res.json();

  // Sort by date descending
  const sorted = sessions
    .filter(s => !!s.start)
    .sort((a, b) => new Date(b.start) - new Date(a.start));

  let session = null;

if (selectedDate) {
  const formatDate = (d) => new Date(d).toISOString().split('T')[0];
  session = sorted.find(s => formatDate(s.start) === selectedDate);
}


  if (!session) return [];

  let stages = [];
  try {
    const parsed = typeof session.data.stages === 'string'
      ? JSON.parse(session.data.stages)
      : session.data.stages;

    stages = parsed.map(s => typeof s === 'string' ? JSON.parse(s) : s);
  } catch (e) {
    console.warn('Stage parsing failed:', e);
    return [];
  }

  return createSleepSegments(stages);
}
async function fetchAvailableSleepDates() {
  const res = await fetch('/api/db/data/sleepsessions');
  if (!res.ok) throw new Error('Failed to fetch sleep data');

  const sessions = await res.json();
  const uniqueDates = Array.from(new Set(
    sessions
      .filter(s => !!s.start)
      .map(s => new Date(s.start).toISOString().split('T')[0])
  ));

  const latest = uniqueDates.sort().at(-1); // 🟢 latest available date
  document.getElementById('sleepDatePicker').value = latest;

  flatpickr("#sleepDatePicker", {
    dateFormat: "Y-m-d",
    enable: uniqueDates,
    defaultDate: latest,
    onChange: function(selectedDates) {
      if (selectedDates.length > 0) {
        const selectedDate = selectedDates[0].toISOString().split("T")[0];
        renderSleepClock(selectedDate); // 🔁 re-render chart with chosen date
      }
    }
  });

  // 🔁 Render chart with latest date immediately
  renderSleepClock(latest);
}



sleepChartInstance = null;

async function renderSleepClock(date = null) {
  const data = await fetchSleepClockData(date);
  sleepSegments = data;

  const ctx = document.getElementById('sleepClock').getContext('2d');

  if (sleepChartInstance) {
    sleepChartInstance.destroy(); // 🔁 destroy old chart
  }

  sleepChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        data: data.map(d => d.value),
        backgroundColor: data.map(d => d.backgroundColor),
        borderWidth: 1,
        borderColor: '#fff'
      }]
    },
    options: {
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 20 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const segment = sleepSegments[ctx.dataIndex];
              const stage = ctx.label;
              const formatTime = t => {
                const date = new Date(t);
                return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              };
              return `Stage ${stage}: ${formatTime(segment.startTime)}–${formatTime(segment.endTime)}`;
            }
          }
        },
        title: {
          display: true,
          text: 'Sleep Stages',
        }
      },
      rotation: -90,
      circumference: 360
    },
    plugins: [sleepClockCenterLabelPlugin]
  });
}


const sleepClockCenterLabelPlugin = {
  id: 'centerText',
  beforeDraw(chart) {
    const { ctx, chartArea } = chart;

    let centerX = chart.width / 2;
    let centerY = chart.height / 2;

    // ✅ Try using the arc metadata center if available
    const meta = chart.getDatasetMeta(0);
    if (meta && meta.data && meta.data.length > 0) {
      const arc = meta.data[0];
      centerX = arc.x;
      centerY = arc.y;
    }

    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((sum, val) => sum + val, 0);
    const totalSeconds = (total / 100) * 86400;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const text = `Total: ${hours}h ${minutes}m`;

    ctx.save();
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#444';
    ctx.fillText(text, centerX, centerY);
    ctx.restore();
  }
};


const sleepClockBackgroundArcPlugin = {
  id: 'sleepArcBackground',
  beforeDatasetsDraw(chart, args, options) {
    const {ctx, chartArea: {width, height}} = chart;
    const dataset = chart.data.datasets[0];
    if (!dataset) return;

    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data.length) return;

    // Find earliest start and latest end angles
    let startAngle = Infinity, endAngle = -Infinity;
    const total = dataset.data.reduce((s, v) => s + v, 0);

    let angleSoFar = chart.options.rotation * Math.PI / 180;

    for (let i = 0; i < dataset.data.length; i++) {
      const value = dataset.data[i];
      const angle = (value / total) * 2 * Math.PI;
      const arcStart = angleSoFar;
      const arcEnd = angleSoFar + angle;

      if (arcStart < startAngle) startAngle = arcStart;
      if (arcEnd > endAngle) endAngle = arcEnd;

      angleSoFar += angle;
    }

    const outerRadius = meta.data[0].outerRadius;
    const innerRadius = meta.data[0].innerRadius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(chart.width / 2, chart.height / 2, outerRadius, startAngle, endAngle);
    ctx.arc(chart.width / 2, chart.height / 2, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fill();
    ctx.restore();
  }
};

document.getElementById('sleepDatePicker').addEventListener('change', (e) => {
  const selectedDate = e.target.value;
  renderSleepClock(selectedDate);
});

fetchAvailableSleepDates();

