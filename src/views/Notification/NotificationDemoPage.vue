<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/notification"></ion-back-button>
        </ion-buttons>
        <ion-title>Factory Alert</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData" fill="clear">
            <ion-icon :icon="refresh"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Alert Header -->
      <div class="alert-header">
        <div class="alert-content">
          <!-- <div class="alert-icon"> -->
          <!-- </div> -->
          <h3 style="display: flex; align-items: center; gap: 0.5rem;">
            <ion-icon :icon="rainy" color="primary" size="medium"></ion-icon>
            Factory Humidity Rising
          </h3>
          <!-- <ion-chip color="warning">
            <ion-icon :icon="warning"></ion-icon>
            <ion-label>Action Required</ion-label>
          </ion-chip> -->
        </div>
      </div>

      <!-- Main Alert Card -->
      <ion-card class="alert-card">
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="rainy" slot="start" color="primary"></ion-icon>
            Rainy Weather Detected
          </ion-card-title>
          <ion-card-subtitle>Immediate Action Required</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="problem-description">
            <h3>⚠️ Problem Description</h3>
            <p>
              Due to the current rainy weather conditions, the humidity levels in your factory are rising rapidly.
              This could potentially affect production equipment, product quality, and worker comfort.
              <strong>Immediate action is required to maintain optimal factory conditions.</strong>
            </p>
          </div>
          <div class="weather-info">
            <div class="weather-item">
              <ion-icon :icon="rainy" color="primary" size="small"></ion-icon>
              <span class="weather-label">Rain:</span>
              <span class="weather-value">{{ currentWeather.precipitation }}mm/h</span>
            </div>
            <div class="weather-item">
              <ion-icon :icon="thermometer" color="medium" size="small"></ion-icon>
              <span class="weather-label">Temp:</span>
              <span class="weather-value">{{ currentWeather.temperature }}°C</span>
            </div>
            <div class="weather-item">
              <ion-icon :icon="water" color="tertiary" size="small"></ion-icon>
              <span class="weather-label">Humidity:</span>
              <span class="weather-value">{{ currentWeather.humidity }}%</span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>
      <!-- Humidity Chart Card -->
      <ion-card class="chart-card">
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="analytics" slot="start" color="tertiary"></ion-icon>
            Humidity Trend (Last 24 Hours)
          </ion-card-title>
          <ion-card-subtitle>Real-time monitoring of factory humidity</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: #3498db;"></div>
              <span>Factory Humidity</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #e74c3c;"></div>
              <span>Critical Level (70%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #f39c12;"></div>
              <span>Warning Level (65%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #27ae60;"></div>
              <span>Optimal Range (45-60%)</span>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="humidityChart" width="400" height="200"></canvas>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Daily Weather Report Card -->
      <ion-card class="weather-report-card">
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="rainy" slot="start" color="primary"></ion-icon>
            Daily Weather Report
          </ion-card-title>
          <ion-card-subtitle>Current conditions and 8-days forecast</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="current-conditions">
            <div class="condition-main">
              <ion-icon :icon="rainy" color="primary" size="large"></ion-icon>
              <div class="condition-details">
                <h3>Heavy Rain</h3>
                <p>Continuous rainfall expected for the next 12 hours</p>
                <ion-chip color="warning">
                  <ion-icon :icon="warning"></ion-icon>
                  <ion-label>Weather Alert Active</ion-label>
                </ion-chip>
              </div>
            </div>
          </div>

          <div class="weather-metrics">
            <div class="metric-item">
              <ion-icon :icon="rainy" color="primary"></ion-icon>
              <div>
                <h4>Precipitation</h4>
                <p><strong>{{ currentWeather.precipitation }}mm/h</strong></p>
                <p class="metric-detail">Total today: 24mm</p>
              </div>
            </div>
            <div class="metric-item">
              <ion-icon :icon="water" color="tertiary"></ion-icon>
              <div>
                <h4>Atmospheric Humidity</h4>
                <p><strong>{{ currentWeather.humidity }}%</strong></p>
                <p class="metric-detail">Above normal (60%)</p>
              </div>
            </div>
            <div class="metric-item">
              <ion-icon :icon="thermometer" color="medium"></ion-icon>
              <div>
                <h4>Temperature</h4>
                <p><strong>{{ currentWeather.temperature }}°C</strong></p>
                <p class="metric-detail">Feels like 16°C</p>
              </div>
            </div>
          </div>

          <div class="hourly-forecast">
            <h4>
              <ion-icon :icon="rainy" color="primary"></ion-icon>
              Next 8 Days Forecast
            </h4>
            <div class="forecast-timeline">
              <div v-for="day in dailyForecast" :key="day.date" class="forecast-hour">
                <div class="forecast-time">{{ day.date }}</div>
                <ion-icon :icon="rainy" :color="day.intensity === 'heavy' ? 'primary' : 'medium'"></ion-icon>
                <div class="forecast-rain">{{ day.rain }}mm</div>
                <div class="forecast-humidity">{{ day.humidity }}%</div>
              </div>
            </div>
          </div>

          <div class="weather-impact">
            <h4>
              <ion-icon :icon="warning" color="warning"></ion-icon>
              Expected Impact on Factory Operations
            </h4>
            <div class="impact-list">
              <div class="impact-item high-impact">
                <ion-icon :icon="rainy" color="danger"></ion-icon>
                <span>Humidity levels will continue rising for next 6 hours</span>
              </div>
              <div class="impact-item medium-impact">
                <ion-icon :icon="rainy" color="warning"></ion-icon>
                <span>Production areas may require additional dehumidification</span>
              </div>
              <div class="impact-item medium-impact">
                <ion-icon :icon="rainy" color="warning"></ion-icon>
                <span>Equipment monitoring frequency should be increased</span>
              </div>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Factory Status Card -->
      <ion-card class="status-card">
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="business" slot="start" color="secondary"></ion-icon>
            Factory Humidity Status
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="humidity-status">
            <div class="status-item" :class="{ 'status-warning': factoryData.currentHumidity > 65 }">
              <div class="status-value">{{ factoryData.currentHumidity }}%</div>
              <div class="status-label">Current Humidity</div>
              <ion-progress-bar :value="factoryData.currentHumidity / 100"
                :color="factoryData.currentHumidity > 65 ? 'warning' : 'success'"></ion-progress-bar>
            </div>
            <div class="status-item">
              <div class="status-value">{{ factoryData.optimalRange.min }}-{{ factoryData.optimalRange.max }}%</div>
              <div class="status-label">Optimal Range</div>
            </div>
            <div class="status-item">
              <div class="status-value">{{ factoryData.trend }}</div>
              <div class="status-label">Trend (Last Hour)</div>
            </div>
          </div>

          <div class="affected-areas">
            <h4>Affected Production Areas:</h4>
            <ion-chip v-for="area in factoryData.affectedAreas" :key="area.name"
              :color="area.severity === 'high' ? 'danger' : area.severity === 'medium' ? 'warning' : 'medium'">
              <ion-icon :icon="area.icon"></ion-icon>
              <ion-label>{{ area.name }} ({{ area.humidity }}%)</ion-label>
            </ion-chip>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Action Items Card -->
      <ion-card class="actions-card">
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="checkboxOutline" slot="start" color="success"></ion-icon>
            Recommended Actions
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item v-for="action in recommendedActions" :key="action.id" @click="toggleAction(action.id)" button>
              <ion-checkbox slot="start" :checked="action.completed"
                @ionChange="toggleAction(action.id)"></ion-checkbox>
              <ion-label>
                <h3>{{ action.title }}</h3>
                <p>{{ action.description }}</p>
                <p class="action-priority">
                  Priority:
                  <ion-chip
                    :color="action.priority === 'high' ? 'danger' : action.priority === 'medium' ? 'warning' : 'success'"
                    size="small">
                    {{ action.priority.toUpperCase() }}
                  </ion-chip>
                </p>
              </ion-label>
              <ion-icon :icon="action.completed ? checkmarkCircle : alertCircle"
                :color="action.completed ? 'success' : 'warning'" slot="end"></ion-icon>
            </ion-item>
          </ion-list>

          <div class="action-buttons">
            <ion-button expand="block" color="primary" @click="markAllComplete">
              <ion-icon :icon="checkmarkDone" slot="start"></ion-icon>
              Mark All Complete
            </ion-button>
            <ion-button expand="block" fill="outline" color="secondary" @click="requestHelp">
              <ion-icon :icon="call" slot="start"></ion-icon>
              Request Emergency Support
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
      <!-- Additional Information -->
      <ion-card class="info-card">
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="informationCircle" slot="start" color="medium"></ion-icon>
            Additional Information
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-icon :icon="time" slot="start" color="medium"></ion-icon>
              <ion-label>
                <h3>Alert Time</h3>
                <p>{{ alertInfo.timestamp }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="location" slot="start" color="medium"></ion-icon>
              <ion-label>
                <h3>Weather Station</h3>
                <p>{{ alertInfo.weatherStation }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="person" slot="start" color="medium"></ion-icon>
              <ion-label>
                <h3>Responsible Manager</h3>
                <p>{{ alertInfo.manager }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="call" slot="start" color="medium"></ion-icon>
              <ion-label>
                <h3>Emergency Contact</h3>
                <p>{{ alertInfo.emergencyContact }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonList,
  IonItem,
  IonCheckbox,
  IonProgressBar
} from '@ionic/vue';
import {
  rainy,
  warning,
  thermometer,
  water,
  business,
  checkboxOutline,
  checkmarkCircle,
  alertCircle,
  checkmarkDone,
  call,
  analytics,
  informationCircle,
  time,
  location,
  person,
  refresh,
  build,
  construct
} from 'ionicons/icons';
import { ref, onMounted, nextTick } from 'vue';

// Reactive data
const humidityChart = ref<HTMLCanvasElement | null>(null);

const currentWeather = ref({
  precipitation: 8.5,
  temperature: 18,
  humidity: 85
});

const factoryData = ref({
  currentHumidity: 68,
  optimalRange: { min: 45, max: 60 },
  trend: '↗️ +12% (Rising)',
  affectedAreas: [
    { name: 'Production Line A', humidity: 72, severity: 'high', icon: build },
    { name: 'Assembly Area', humidity: 69, severity: 'high', icon: construct },
    { name: 'Quality Control', humidity: 65, severity: 'medium', icon: checkmarkCircle },
    { name: 'Packaging Zone', humidity: 63, severity: 'medium', icon: business }
  ]
});

const recommendedActions = ref([
  {
    id: 1,
    title: 'Activate Dehumidification Systems',
    description: 'Turn on all industrial dehumidifiers in affected areas',
    priority: 'high',
    completed: false
  },
  {
    id: 2,
    title: 'Increase Ventilation',
    description: 'Open ventilation systems to maximum capacity',
    priority: 'high',
    completed: false
  },
  {
    id: 3,
    title: 'Check Equipment Seals',
    description: 'Inspect and secure all equipment covers and seals',
    priority: 'medium',
    completed: false
  },
  {
    id: 4,
    title: 'Monitor Product Storage',
    description: 'Ensure moisture-sensitive products are properly protected',
    priority: 'medium',
    completed: false
  },
  {
    id: 5,
    title: 'Update Weather Monitoring',
    description: 'Increase frequency of humidity readings to every 15 minutes',
    priority: 'low',
    completed: true
  },
  {
    id: 6,
    title: 'Notify Production Teams',
    description: 'Alert all shift supervisors about humidity conditions',
    priority: 'high',
    completed: true
  }
]);

const alertInfo = ref({
  timestamp: new Date().toLocaleString(),
  weatherStation: 'Factory Weather Station #1',
  manager: 'Sarah Johnson - Production Manager',
  emergencyContact: '+1 (555) 123-4567'
});

// Daily forecast data
const dailyForecast = ref([
  { date: 'Today', rain: 24.0, humidity: 85, intensity: 'heavy' },
  { date: 'Thu', rain: 18.5, humidity: 82, intensity: 'heavy' },
  { date: 'Fri', rain: 12.3, humidity: 78, intensity: 'moderate' },
  { date: 'Sat', rain: 8.7, humidity: 75, intensity: 'moderate' },
  { date: 'Sun', rain: 15.2, humidity: 79, intensity: 'moderate' },
  { date: 'Mon', rain: 6.4, humidity: 72, intensity: 'light' },
  { date: 'Tue', rain: 3.1, humidity: 68, intensity: 'light' },
  { date: 'Wed', rain: 1.8, humidity: 65, intensity: 'light' }
]);

// Mock humidity data for the last 24 hours
const humidityData = [
  52, 54, 53, 55, 56, 54, 53, 52, 54, 56, 58, 59,
  61, 63, 62, 64, 66, 65, 67, 68, 69, 67, 68, 68
];

const timeLabels = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

// Methods
const toggleAction = (actionId: number) => {
  const action = recommendedActions.value.find(a => a.id === actionId);
  if (action) {
    action.completed = !action.completed;
  }
};

const markAllComplete = () => {
  recommendedActions.value.forEach(action => {
    action.completed = true;
  });
};

const requestHelp = () => {
  // Simulate requesting emergency support
  alert('Emergency support has been notified. Expected response time: 15 minutes.');
};

const refreshData = () => {
  // Simulate data refresh
  factoryData.value.currentHumidity = Math.floor(Math.random() * 10) + 65;
  currentWeather.value.humidity = Math.floor(Math.random() * 10) + 80;
  currentWeather.value.precipitation = Math.floor(Math.random() * 5) + 5;

  // Redraw chart
  drawHumidityChart();
};

const drawHumidityChart = () => {
  if (!humidityChart.value) return;

  const canvas = humidityChart.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set up chart dimensions
  const padding = 40;
  const chartWidth = canvas.width - 2 * padding;
  const chartHeight = canvas.height - 2 * padding;

  // Draw grid lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + chartWidth, y);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${80 - i * 10}%`, padding - 10, y + 4);
  }

  // Vertical grid lines (every 4 hours)
  for (let i = 0; i <= 6; i++) {
    const x = padding + (chartWidth / 6) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, padding + chartHeight);
    ctx.stroke();

    // X-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(timeLabels[i * 4] || '', x, canvas.height - 10);
  }

  // Draw critical level line (70%)
  const criticalY = padding + chartHeight - ((70 - 30) / 50) * chartHeight;
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding, criticalY);
  ctx.lineTo(padding + chartWidth, criticalY);
  ctx.stroke();

  // Draw warning level line (65%)
  const warningY = padding + chartHeight - ((65 - 30) / 50) * chartHeight;
  ctx.strokeStyle = '#f39c12';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding, warningY);
  ctx.lineTo(padding + chartWidth, warningY);
  ctx.stroke();

  // Draw optimal range background
  const optimalTop = padding + chartHeight - ((60 - 30) / 50) * chartHeight;
  const optimalBottom = padding + chartHeight - ((45 - 30) / 50) * chartHeight;
  ctx.fillStyle = 'rgba(39, 174, 96, 0.1)';
  ctx.fillRect(padding, optimalTop, chartWidth, optimalBottom - optimalTop);

  // Draw humidity line
  ctx.strokeStyle = '#3498db';
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.beginPath();

  for (let i = 0; i < humidityData.length; i++) {
    const x = padding + (chartWidth / (humidityData.length - 1)) * i;
    const y = padding + chartHeight - ((humidityData[i] - 30) / 50) * chartHeight;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    // Draw data points
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.stroke();
};

// Lifecycle
onMounted(async () => {
  await nextTick();
  drawHumidityChart();
});
</script>

<style scoped>
.alert-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1));
  margin: 1rem;
  border-radius: 12px;
  border-left: 5px solid var(--ion-color-primary);
}

.alert-icon {
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(var(--ion-color-primary-rgb), 0.1);
}

.alert-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.alert-card {
  margin: 0 1rem 1rem 1rem;
}

.weather-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.weather-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.weather-label {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  font-weight: 500;
}

.weather-value {
  font-size: 0.9rem;
  color: var(--ion-color-dark);
  font-weight: 600;
}

.weather-item h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.weather-item p {
  margin: 0;
  font-size: 1rem;
  color: var(--ion-color-medium);
}

.problem-description {
  padding: 1rem;
  background: rgba(var(--ion-color-warning-rgb), 0.1);
  border-radius: 8px;
  border-left: 4px solid var(--ion-color-warning);
}

.problem-description h3 {
  margin: 0 0 0.75rem 0;
  color: var(--ion-color-warning-shade);
}

.problem-description p {
  margin: 0;
  line-height: 1.5;
}

.status-card {
  margin: 0 1rem 1rem 1rem;
}

.humidity-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-item {
  text-align: center;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.status-item.status-warning {
  background: rgba(var(--ion-color-warning-rgb), 0.1);
  border: 2px solid var(--ion-color-warning);
}

.status-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ion-color-dark);
  margin-bottom: 0.25rem;
}

.status-label {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  margin-bottom: 0.5rem;
}

.affected-areas {
  margin-top: 1rem;
}

.affected-areas h4 {
  margin: 0 0 0.75rem 0;
  color: var(--ion-color-dark);
}

.affected-areas ion-chip {
  margin: 0.25rem 0.5rem 0.25rem 0;
}

.actions-card {
  margin: 0 1rem 1rem 1rem;
}

.action-priority {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.action-buttons {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-card {
  margin: 0 1rem 1rem 1rem;
}

.chart-container {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0;
}

.chart-container canvas {
  max-width: 100%;
  height: auto;
}

.chart-legend {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.6rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.info-card {
  margin: 0 1rem 2rem 1rem;
}

/* Weather Report Card Styles */
.weather-report-card {
  margin: 0 1rem 1rem 1rem;
}

.current-conditions {
  margin-bottom: 1.5rem;
}

.condition-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(var(--ion-color-primary-rgb), 0.05);
  border-radius: 12px;
  border-left: 4px solid var(--ion-color-primary);
}

.condition-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.condition-details p {
  margin: 0 0 0.75rem 0;
  color: var(--ion-color-medium);
}

.weather-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.metric-item h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.metric-item p {
  margin: 0;
  font-size: 1rem;
}

.metric-detail {
  font-size: 0.8rem !important;
  color: var(--ion-color-medium) !important;
}

.hourly-forecast {
  margin-bottom: 1.5rem;
}

.hourly-forecast h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  color: var(--ion-color-dark);
}

.forecast-timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
}

.forecast-hour {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  background: var(--ion-color-light);
  border-radius: 8px;
  text-align: center;
}

.forecast-time {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin-bottom: 0.5rem;
}

.forecast-rain {
  font-size: 0.8rem;
  color: var(--ion-color-primary);
  font-weight: 600;
  margin: 0.25rem 0;
}

.forecast-humidity {
  font-size: 0.7rem;
  color: var(--ion-color-medium);
}

.weather-impact h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  color: var(--ion-color-dark);
}

.impact-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.impact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.impact-item.high-impact {
  background: rgba(var(--ion-color-danger-rgb), 0.1);
  border-left: 3px solid var(--ion-color-danger);
}

.impact-item.medium-impact {
  background: rgba(var(--ion-color-warning-rgb), 0.1);
  border-left: 3px solid var(--ion-color-warning);
}

ion-card-title {
  font-size: 1rem;
  /* Adjust this value as needed */
}

/* Or target specific cards if you want different sizes */
.alert-card ion-card-title {
  font-size: 0.9rem;
}

.chart-card ion-card-title {
  font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .alert-header {
    flex-direction: column;
    text-align: center;
  }

  .alert-icon {
    margin: 0 0 1rem 0;
  }

  .weather-info {
    /* flex-direction: column; */
    /* align-items: center; */
  }

  .humidity-status {
    grid-template-columns: 1fr;
  }

  /* .chart-legend {
    flex-direction: column;
    align-items: flex-start;
  } */

  .weather-metrics {
    grid-template-columns: 1fr;
  }

  .forecast-timeline {
    grid-template-columns: repeat(4, 1fr);
  }

  .condition-main {
    flex-direction: column;
    text-align: center;
  }
}
</style>