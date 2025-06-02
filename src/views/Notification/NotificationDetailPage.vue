<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/notification"></ion-back-button>
        </ion-buttons>
        <ion-title>Notification Details</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleRead" fill="clear">
            <ion-icon :icon="notification?.read ? mailUnread : mailOpen"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div v-if="notification" class="notification-detail">
        <!-- Notification Header -->
        <div class="notification-header">
          <div class="notification-icon">
            <ion-icon 
              :icon="getNotificationIcon(notification.type)" 
              :color="getNotificationColor(notification.type)"
              size="large"
            ></ion-icon>
          </div>
          <div class="notification-meta">
            <h1>{{ notification.title }}</h1>
            <div class="notification-info">
              <ion-chip :color="getNotificationColor(notification.type)">
                <ion-icon :icon="getNotificationIcon(notification.type)"></ion-icon>
                <ion-label>{{ notification.type.toUpperCase() }}</ion-label>
              </ion-chip>
              <span class="notification-timestamp">
                {{ notification.date }} at {{ notification.time }}
              </span>
            </div>
          </div>
        </div>

        <!-- Notification Content -->
        <div class="notification-content">
          <ion-card>
            <ion-card-header>
              <ion-card-title>Message</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>{{ notification.message }}</p>
              <div v-if="notification.details">
                <h3>Details</h3>
                <div v-html="notification.details"></div>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Actions -->
          <div v-if="notification.actions && notification.actions.length > 0" class="notification-actions">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Actions</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-button 
                  v-for="action in notification.actions" 
                  :key="action.id"
                  :color="action.color || 'primary'"
                  :fill="action.fill || 'solid'"
                  @click="handleAction(action)"
                  class="action-button"
                >
                  <ion-icon v-if="action.icon" :icon="action.icon" slot="start"></ion-icon>
                  {{ action.label }}
                </ion-button>
              </ion-card-content>
            </ion-card>
          </div>

          <!-- Related Information -->
          <div v-if="notification.relatedInfo" class="related-info">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Related Information</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list>
                  <ion-item v-for="info in notification.relatedInfo" :key="info.label">
                    <ion-label>
                      <h3>{{ info.label }}</h3>
                      <p>{{ info.value }}</p>
                    </ion-label>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <ion-spinner></ion-spinner>
        <p>Loading notification...</p>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <ion-icon :icon="alertCircle" size="large"></ion-icon>
        <h3>Notification not found</h3>
        <p>The notification you're looking for doesn't exist or has been deleted.</p>
        <ion-button @click="goBack" fill="outline">
          Go Back
        </ion-button>
      </div>
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
  IonCardContent,
  IonChip,
  IonLabel,
  IonList,
  IonItem,
  IonSpinner
} from '@ionic/vue';
import {
  alertCircle,
  checkmarkCircle,
  informationCircle,
  warning,
  mail,
  mailOpen,
  mailUnread,
  build,
  calendar,
  person
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notificationService, type Notification, type NotificationAction } from '@/services/notificationService';

const route = useRoute();
const router = useRouter();
const notification = ref<Notification | null>(null);
const loading = ref(true);

// Load notification on component mount
onMounted(() => {
  loadNotification();
});

const loadNotification = () => {
  const id = route.params.id as string;
  
  // Get notification from service
  notification.value = notificationService.getNotificationById(id) || null;
  loading.value = false;
  
  if (!notification.value) {
    console.error('Notification not found:', id);
  }
};

const toggleRead = () => {
  if (notification.value) {
    notification.value.read = !notification.value.read;
    notificationService.markAsRead(notification.value.id);
  }
};

const handleAction = (action: NotificationAction) => {
  // Handle different actions
  console.log('Action clicked:', action.id);
  // You can implement specific logic for each action here
};

const goBack = () => {
  router.push('/tabs/notification');
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
.notification-detail {
  padding: 1rem;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.notification-icon {
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(var(--ion-color-primary-rgb), 0.1);
}

.notification-meta {
  flex: 1;
}

.notification-meta h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.notification-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.notification-timestamp {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-actions .action-button {
  margin: 0.25rem 0.5rem 0.25rem 0;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--ion-color-medium);
}

.loading-state ion-spinner,
.error-state ion-icon {
  margin-bottom: 1rem;
  font-size: 3rem;
}

.error-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--ion-color-dark);
}

.error-state p {
  margin: 0 0 1.5rem 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .notification-header {
    flex-direction: column;
    text-align: center;
  }
  
  .notification-icon {
    margin: 0 0 1rem 0;
    align-self: center;
  }
  
  .notification-info {
    justify-content: center;
  }
}
</style>
