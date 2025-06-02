<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Me</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Me</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="me-content">
        <!-- User Profile Section -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Profile</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="profile-info">
              <ion-avatar>
                <ion-icon :icon="person" size="large"></ion-icon>
              </ion-avatar>
              <div class="profile-details">
                <h2>Factory Manager</h2>
                <p>Production Line Supervisor</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Notification Settings -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Notification Settings</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <!-- Connection Status -->
            <ion-item>
              <ion-icon :icon="wifi" slot="start" :color="connected ? 'success' : 'medium'"></ion-icon>
              <ion-label>
                <h3>Server Connection</h3>
                <p>{{ connected ? 'Connected to ' + currentUrl : 'Not connected' }}</p>
              </ion-label>
              <ion-chip :color="connected ? 'success' : 'danger'" slot="end">
                {{ connected ? 'Connected' : 'Disconnected' }}
              </ion-chip>
            </ion-item>

            <!-- Notification Count -->
            <ion-item>
              <ion-icon :icon="notifications" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h3>Notifications</h3>
                <p>{{ totalNotifications }} total, {{ unreadCount }} unread</p>
              </ion-label>
              <ion-badge color="primary" slot="end">{{ unreadCount }}</ion-badge>
            </ion-item>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <ion-button 
                expand="block" 
                color="tertiary"
                @click="viewNotificationDemo"
                class="action-button"
              >
                <ion-icon :icon="rainy" slot="start"></ion-icon>
                View Weather Alert Demo
              </ion-button>

              <ion-button 
                expand="block" 
                :color="connected ? 'danger' : 'primary'"
                @click="toggleConnection"
                class="action-button"
              >
                <ion-icon :icon="connected ? wifiOutline : wifi" slot="start"></ion-icon>
                {{ connected ? 'Disconnect from Server' : 'Connect to SSE Server' }}
              </ion-button>

              <ion-button 
                expand="block" 
                fill="outline" 
                color="secondary"
                @click="testNotification"
                :disabled="isTestNotificationPending"
                class="action-button"
              >
                <ion-icon :icon="add" slot="start"></ion-icon>
                {{ isTestNotificationPending ? `Test in ${testNotificationCountdown}s...` : 'Test Notification Locally (5s delay)' }}
              </ion-button>

              <ion-button 
                expand="block" 
                fill="solid" 
                color="danger"
                @click="testLocalNotification"
                class="action-button"
              >
                <ion-icon :icon="notifications" slot="start"></ion-icon>
                Test Local Notification (SSE)
              </ion-button>

              <ion-button 
                expand="block" 
                fill="outline" 
                color="tertiary"
                @click="testHeartbeatFiltering"
                class="action-button"
              >
                <ion-icon :icon="pulse" slot="start"></ion-icon>
                Test Heartbeat Filtering
              </ion-button>

              <ion-button 
                expand="block" 
                fill="clear" 
                color="medium"
                @click="clearAllNotifications"
                class="action-button"
              >
                <ion-icon :icon="trash" slot="start"></ion-icon>
                Clear All Notifications
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- App Information -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>App Information</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-icon :icon="informationCircle" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h3>Version</h3>
                <p>1.0.0</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-icon :icon="build" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h3>Build</h3>
                <p>Production Notification Tool</p>
              </ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Connection Modal -->
      <ion-modal :is-open="isConnectionModalOpen" @did-dismiss="isConnectionModalOpen = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>SSE Server Connection</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isConnectionModalOpen = false" fill="clear">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Server URL</ion-label>
            <ion-input 
              v-model="serverUrl" 
              placeholder="http://localhost:3000/events"
              type="url"
            ></ion-input>
          </ion-item>
          
          <div class="modal-actions">
            <ion-button 
              expand="block" 
              @click="connectToServer"
              :disabled="!serverUrl"
            >
              <ion-icon :icon="wifi" slot="start"></ion-icon>
              Connect
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonAvatar,
  IonChip,
  IonBadge,
  IonButton,
  IonModal,
  IonButtons,
  IonInput
} from '@ionic/vue';
import { 
  person,
  wifi,
  wifiOutline,
  notifications,
  add,
  informationCircle,
  build,
  trash,
  close,
  pulse,
  rainy
} from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { notificationService } from '@/services/notificationService';

const router = useRouter();

// Reactive data from notification service
const connected = notificationService.connected;
const currentUrl = notificationService.currentUrl;
const allNotifications = notificationService.allNotifications;

// Local reactive data
const isConnectionModalOpen = ref(false);
const serverUrl = ref('http://localhost:3000/events');
const isTestNotificationPending = ref(false);
const testNotificationCountdown = ref(0);

// Computed properties
const unreadCount = computed(() => notificationService.getUnreadCount());
const totalNotifications = computed(() => allNotifications.value.length);

// Methods
const toggleConnection = () => {
  if (connected.value) {
    notificationService.disconnect();
  } else {
    isConnectionModalOpen.value = true;
  }
};

const viewNotificationDemo = () => {
  router.push('/tabs/notification-demo');
};

const connectToServer = () => {
  if (serverUrl.value) {
    notificationService.connect(serverUrl.value);
    setTimeout(() => {
      isConnectionModalOpen.value = false;
    }, 1000);
  }
};

const testNotification = () => {
  if (isTestNotificationPending.value) {
    return; // Prevent multiple simultaneous tests
  }

  isTestNotificationPending.value = true;
  testNotificationCountdown.value = 5; // Changed to 5 seconds to match native delay

  // Start countdown for UI feedback
  const countdownInterval = setInterval(() => {
    testNotificationCountdown.value--;
    
    if (testNotificationCountdown.value <= 0) {
      clearInterval(countdownInterval);
      isTestNotificationPending.value = false;
    }
  }, 1000);

  // Immediately trigger the native local notification (which has 5s delay built-in)
  const testTypes = ['success', 'warning', 'error', 'info', 'message'];
  const randomType = testTypes[Math.floor(Math.random() * testTypes.length)];
  
  notificationService.testNativeLocalNotification({
    title: `Waring: Humidity is too high!`,
    message: `Your factory is experiencing high humidity levels. Immediate action is required.`,
    type: randomType as any,
    details: `
      <p><strong>Test Details:</strong></p>
      <p>This notification was generated using native local notifications with a 5-second delay.</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Type:</strong> ${randomType}</p>
      <p><strong>Delay:</strong> 5 seconds (native schedule)</p>
    `,
    actions: [
      {
        id: 'acknowledge',
        label: 'Acknowledge',
        color: 'primary'
      },
      {
        id: 'dismiss',
        label: 'Dismiss',
        color: 'medium',
        fill: 'outline'
      }
    ],
    relatedInfo: [
      { label: 'Source', value: 'Native Local Test' },
      { label: 'Generated At', value: new Date().toLocaleString() },
      { label: 'Test ID', value: Math.random().toString(36).substr(2, 9) },
      { label: 'Delay', value: '5 seconds (native)' }
    ]
  });
};

const testHeartbeatFiltering = () => {
  notificationService.testHeartbeatFiltering();
};

// Test local notification specifically
const testLocalNotification = () => {
  // Simulate an SSE event that should trigger a local notification
  notificationService.simulateNotification({
    title: '🏭 Factory Emergency Alert',
    message: 'Production line stopped - immediate attention required',
    type: 'error',
    details: `
      <p><strong>Alert Level:</strong> Critical Priority</p>
      <p><strong>Location:</strong> Production Floor A, Line 1</p>
      <p><strong>Issue:</strong> Emergency stop activated</p>
      <p><strong>Action Required:</strong> Immediate response needed</p>
    `,
    actions: [
      {
        id: 'respond',
        label: 'Respond Now',
        color: 'danger'
      },
      {
        id: 'acknowledge',
        label: 'Acknowledge',
        color: 'medium',
        fill: 'outline'
      }
    ],
    relatedInfo: [
      { label: 'Machine ID', value: 'PROD-001' },
      { label: 'Alert Time', value: new Date().toLocaleString() },
      { label: 'Severity', value: 'Critical' }
    ]
  });
};

const clearAllNotifications = () => {
  notificationService.clearAll();
};
</script>

<style scoped>
.me-content {
  padding: 1rem;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-details h2 {
  margin: 0;
  color: var(--ion-color-dark);
}

.profile-details p {
  margin: 0.25rem 0 0 0;
  color: var(--ion-color-medium);
}

.action-buttons {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-button {
  margin: 0;
}

.modal-actions {
  margin-top: 1rem;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-card {
  margin-bottom: 1rem;
}
</style>
