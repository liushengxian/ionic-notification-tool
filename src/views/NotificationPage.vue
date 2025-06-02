<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Notifications</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showConnectionModal" fill="clear">
            <ion-icon :icon="connected ? wifi : wifiOutline" :color="connected ? 'success' : 'medium'"></ion-icon>
          </ion-button>
          <ion-button @click="markAllAsRead" fill="clear">
            <ion-icon :icon="checkmarkDoneOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Notifications</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Demo Weather Alert Card -->
      <ion-card color="tertiary">
        <ion-card-content>
          <div class="demo-card-content">
            <ion-icon :icon="rainy" size="large" color="light"></ion-icon>
            <div class="demo-info">
              <h3>Weather Alert Demo</h3>
              <p>View a comprehensive notification demo with weather alerts and factory humidity monitoring</p>
            </div>
            <ion-button 
              @click="viewDemoPage" 
              fill="solid" 
              color="light"
              class="demo-button"
            >
              <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
              View Demo
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Connection Status -->
      <ion-card v-if="!connected" color="warning">
        <ion-card-content>
          <div class="connection-status">
            <ion-icon :icon="wifiOutline"></ion-icon>
            <div>
              <h3>Not Connected</h3>
              <p>Tap the connection icon to connect to notification server</p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Notification List -->
      <ion-list>
        <ion-item-group v-for="group in groupedNotifications" :key="group.date">
          <ion-item-divider>
            <ion-label>{{ group.date }}</ion-label>
          </ion-item-divider>
          
          <ion-item 
            v-for="notification in group.notifications" 
            :key="notification.id"
            :class="{ 'notification-unread': !notification.read }"
            @click="viewNotificationDetail(notification.id)"
            button
          >
            <ion-avatar slot="start">
              <ion-icon 
                :icon="getNotificationIcon(notification.type)" 
                :color="getNotificationColor(notification.type)"
                size="large"
              ></ion-icon>
            </ion-avatar>
            
            <ion-label>
              <h2>{{ notification.title }}</h2>
              <p>{{ notification.message }}</p>
              <p class="notification-time">{{ notification.time }}</p>
            </ion-label>
            
            <ion-badge 
              v-if="!notification.read" 
              color="primary" 
              slot="end"
            >
              New
            </ion-badge>
            
            <ion-icon 
              :icon="chevronForward" 
              slot="end" 
              color="medium"
            ></ion-icon>
          </ion-item>
        </ion-item-group>
      </ion-list>

      <!-- Empty State -->
      <div v-if="notifications.length === 0" class="empty-state">
        <ion-icon :icon="notificationsOffOutline" size="large"></ion-icon>
        <h3>No notifications</h3>
        <p>You're all caught up!</p>
      </div>

      <!-- Connection Modal -->
      <ion-modal :is-open="isConnectionModalOpen" @did-dismiss="isConnectionModalOpen = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Connection Settings</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isConnectionModalOpen = false" fill="clear">
                <ion-icon :icon="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <ion-content class="ion-padding">
          <div class="connection-form">
            <ion-item>
              <ion-label position="stacked">Server URL</ion-label>
              <ion-input 
                v-model="serverUrl" 
                placeholder="http://localhost:3000/events"
                type="url"
              ></ion-input>
            </ion-item>
            
            <div class="connection-actions">
              <ion-button 
                v-if="!connected" 
                @click="connectToServer" 
                expand="block" 
                :disabled="!serverUrl"
              >
                <ion-icon :icon="wifi" slot="start"></ion-icon>
                Connect
              </ion-button>
              
              <ion-button 
                v-else 
                @click="disconnectFromServer" 
                expand="block" 
                color="danger"
              >
                <ion-icon :icon="wifiOutline" slot="start"></ion-icon>
                Disconnect
              </ion-button>
              
              <ion-button 
                @click="testNotification" 
                expand="block" 
                fill="outline"
              >
                <ion-icon :icon="notificationIcon" slot="start"></ion-icon>
                Test Notification
              </ion-button>
            </div>
            
            <ion-card>
              <ion-card-header>
                <ion-card-title>Connection Status</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="status-info">
                  <div class="status-item">
                    <span>Status:</span>
                    <ion-chip :color="connected ? 'success' : 'danger'">
                      {{ connected ? 'Connected' : 'Disconnected' }}
                    </ion-chip>
                  </div>
                  <div v-if="currentUrl" class="status-item">
                    <span>URL:</span>
                    <span class="url-text">{{ currentUrl }}</span>
                  </div>
                  <div class="status-item">
                    <span>Notifications:</span>
                    <span>{{ notifications.length }} total, {{ unreadCount }} unread</span>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
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
  IonList,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonAvatar,
  IonIcon,
  IonBadge,
  IonButtons,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonModal,
  IonInput,
  IonChip
} from '@ionic/vue';
import { 
  checkmarkDoneOutline,
  notificationsOffOutline,
  alertCircle,
  checkmarkCircle,
  informationCircle,
  warning,
  mail,
  chevronForward,
  wifi,
  wifiOutline,
  close,
  notifications as notificationIcon,
  rainy,
  eyeOutline
} from 'ionicons/icons';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { notificationService, type Notification } from '@/services/notificationService';

const router = useRouter();

// Reactive data from notification service
const notifications = notificationService.allNotifications;
const connected = notificationService.connected;
const currentUrl = notificationService.currentUrl;

// Local reactive data
const isConnectionModalOpen = ref(false);
const serverUrl = ref('http://localhost:3000/events'); // Default SSE endpoint

// Computed properties
const unreadCount = computed(() => notificationService.getUnreadCount());

// Group notifications by date
const groupedNotifications = computed(() => {
  const groups: { [key: string]: Notification[] } = {};
  
  notifications.value.forEach(notification => {
    if (!groups[notification.date]) {
      groups[notification.date] = [];
    }
    groups[notification.date].push(notification);
  });
  
  return Object.entries(groups).map(([date, notifications]) => ({
    date,
    notifications: notifications.sort((a, b) => {
      // Sort by read status (unread first) then by time
      if (a.read === b.read) return 0;
      return a.read ? 1 : -1;
    })
  }));
});

// Lifecycle hooks
onMounted(() => {
  // Request notification permission on component mount
  notificationService.requestNotificationPermission();
});

onUnmounted(() => {
  // Cleanup on component unmount if needed
});

// Methods
const showConnectionModal = () => {
  isConnectionModalOpen.value = true;
};

const connectToServer = async () => {
  if (serverUrl.value) {
    notificationService.connect(serverUrl.value);
    // Close modal after a short delay to show connection status
    setTimeout(() => {
      isConnectionModalOpen.value = false;
    }, 1000);
  }
};

const disconnectFromServer = () => {
  notificationService.disconnect();
};

const testNotification = () => {
  notificationService.simulateNotification({
    title: 'Test Notification',
    message: 'This is a test notification to verify the system is working',
    type: 'info'
  });
};

// Navigate to notification detail page
const viewNotificationDetail = (id: string) => {
  // Mark as read when viewing
  notificationService.markAsRead(id);
  
  // Navigate to detail page
  router.push(`/tabs/notification/${id}`);
};

// Navigate to demo page
const viewDemoPage = () => {
  router.push('/tabs/notification-demo');
};

// Mark all notifications as read
const markAllAsRead = () => {
  notificationService.markAllAsRead();
};

// Get icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success': return checkmarkCircle;
    case 'warning': return warning;
    case 'error': return alertCircle;
    case 'info': return informationCircle;
    case 'message': return mail;
    default: return informationCircle;
  }
};

// Get color based on notification type
const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    case 'info': return 'primary';
    case 'message': return 'medium';
    default: return 'medium';
  }
};
</script>

<style scoped>
.notification-unread {
  --background: rgba(var(--ion-color-primary-rgb), 0.05);
  border-left: 4px solid var(--ion-color-primary);
}

.notification-unread:hover {
  --background: rgba(var(--ion-color-primary-rgb), 0.1);
}

.demo-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.demo-info {
  flex: 1;
}

.demo-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--ion-color-light);
  font-weight: 600;
}

.demo-info p {
  margin: 0;
  color: var(--ion-color-light-shade);
  font-size: 0.9rem;
}

.demo-button {
  --padding-start: 1rem;
  --padding-end: 1rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.connection-status ion-icon {
  font-size: 2rem;
  color: var(--ion-color-warning);
}

.connection-status h3 {
  margin: 0 0 0.25rem 0;
  color: var(--ion-color-warning-shade);
}

.connection-status p {
  margin: 0;
  color: var(--ion-color-warning-shade);
}

ion-item[button] {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

ion-item[button]:hover {
  --background: var(--ion-color-light-shade);
}

.notification-time {
  color: var(--ion-color-medium);
  font-size: 0.8rem;
  margin-top: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  margin-bottom: 1rem;
  font-size: 4rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--ion-color-dark);
}

.empty-state p {
  margin: 0;
}
</style>
