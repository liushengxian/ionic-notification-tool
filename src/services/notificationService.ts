import { ref, reactive } from 'vue';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import router from '@/router';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'message';
  time: string;
  date: string;
  read: boolean;
  details?: string;
  actions?: NotificationAction[];
  relatedInfo?: RelatedInfo[];
}

export interface NotificationAction {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  fill?: 'clear' | 'outline' | 'solid' | 'default';
}

export interface RelatedInfo {
  label: string;
  value: string;
}

interface SSENotificationData {
  id?: string;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'message';
  details?: string;
  actions?: NotificationAction[];
  relatedInfo?: RelatedInfo[];
}

class NotificationService {
  private eventSource: EventSource | null = null;
  private notifications = ref<Notification[]>([]);
  private isConnected = ref(false);
  private connectionUrl = ref('');
  private reconnectInterval: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private pushNotificationsInitialized = false;

  // Mock initial data for development
  private mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Production Line Alert',
      message: 'Machine #3 requires maintenance check',
      type: 'warning',
      time: '2 hours ago',
      date: 'Today',
      read: false,
      details: `
        <p><strong>Alert Level:</strong> Medium Priority</p>
        <p><strong>Machine Status:</strong> Operational with reduced efficiency</p>
        <p><strong>Recommended Action:</strong> Schedule maintenance within 24 hours</p>
        <p><strong>Impact:</strong> 15% reduction in production capacity if not addressed</p>
      `,
      actions: [
        {
          id: 'schedule',
          label: 'Schedule Maintenance',
          color: 'warning'
        },
        {
          id: 'acknowledge',
          label: 'Acknowledge Alert',
          color: 'medium',
          fill: 'outline'
        }
      ],
      relatedInfo: [
        { label: 'Machine ID', value: 'PROD-003' },
        { label: 'Location', value: 'Production Floor B, Line 3' },
        { label: 'Last Maintenance', value: '2024-05-15' },
        { label: 'Operating Hours', value: '1,250 hours' }
      ]
    },
    {
      id: '2',
      title: 'Quality Check Completed',
      message: 'Batch #QC-2024-001 passed all quality tests',
      type: 'success',
      time: '4 hours ago',
      date: 'Today',
      read: false
    },
    {
      id: '3',
      title: 'New Order Received',
      message: 'Order #ORD-12345 has been assigned to your factory',
      type: 'info',
      time: '6 hours ago',
      date: 'Today',
      read: true
    }
  ];

  constructor() {
    // Initialize with mock data
    this.notifications.value = [...this.mockNotifications];
    
    // Initialize push notifications
    this.initializePushNotifications();
  }

  // Initialize push notifications
  private async initializePushNotifications(): Promise<void> {
    try {
      // Initialize local notifications for both web and native platforms
      await this.initializeLocalNotifications();

      // Initialize push notifications only on native platforms
      if (Capacitor.isNativePlatform()) {
        await this.initializePushNotificationsNative();
      } else {
        console.log('🔔 Running on web platform - using browser notifications');
        await this.requestBrowserNotificationPermission();
      }

      this.pushNotificationsInitialized = true;
      console.log('✅ Notification system initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing notification system:', error);
    }
  }

  // Initialize local notifications
  private async initializeLocalNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return; // Browser notifications handled separately
    }

    try {
      // Check and request local notification permissions
      let localPermStatus = await LocalNotifications.checkPermissions();
      console.log('📱 Local notification permission status:', localPermStatus);

      if (localPermStatus.display === 'prompt') {
        const result = await LocalNotifications.requestPermissions();
        console.log('📱 Local notification permission request result:', result);
        
        if (result.display !== 'granted') {
          console.warn('⚠️ Local notification permission denied');
          return;
        }
      }

      if (localPermStatus.display !== 'granted') {
        console.warn('⚠️ Local notification permission not granted');
        return;
      }

      // Add listeners for local notification events
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('📥 Local notification received:', notification);
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        console.log('👆 Local notification action performed:', notificationAction);
        
        // Navigate to notification demo page when notification is tapped
        console.log('🧭 Navigating to notification demo page from local notification');
        router.push('/tabs/notification-demo');
      });

      console.log('✅ Local notifications initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing local notifications:', error);
    }
  }

  // Initialize push notifications for native platforms
  private async initializePushNotificationsNative(): Promise<void> {
    try {
      // Request permission to use push notifications
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('⚠️ Push notification permission denied');
        return;
      }

      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', (token) => {
        console.log('✅ Push registration success, token: ' + token.value);
      });

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', (error) => {
        console.error('❌ Push registration error: ', error.error);
      });

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📥 Push notification received: ', notification);
        
        // Add the notification to our local list
        if (notification.title && notification.body) {
          this.addNotification({
            title: notification.title,
            message: notification.body,
            type: 'info'
          });
        }
      });

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notificationAction) => {
        console.log('👆 Push notification action performed: ', notificationAction.actionId, notificationAction.inputValue);
        
        // Navigate to notification detail page when push notification is tapped
        if (notificationAction.notification.data?.notificationId) {
          const notificationId = notificationAction.notification.data.notificationId;
          console.log('🧭 Navigating to notification detail from push:', notificationId);
          
          // Navigate to the notification detail page
          router.push(`/tabs/notification/${notificationId}`);
        } else {
          // Fallback: navigate to notifications page
          console.log('🧭 Navigating to notifications page from push (no specific ID)');
          router.push('/tabs/notification');
        }
      });

      console.log('✅ Push notifications initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    }
  }

  // Request browser notification permission
  private async requestBrowserNotificationPermission(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('⚠️ This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Browser notification permission already granted');
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Browser notification permission granted');
      } else {
        console.warn('⚠️ Browser notification permission denied');
      }
    }
  }

  // Send a local push notification
  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Native platform - use Capacitor LocalNotifications
        await this.sendNativeLocalNotification(notification);
      } else {
        // Web platform - use browser notifications
        this.showBrowserNotification(notification);
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  // Send native local notification
  private async sendNativeLocalNotification(notification: Notification): Promise<void> {
    if (!this.pushNotificationsInitialized) {
      console.warn('⚠️ Notification system not initialized');
      return;
    }

    try {
      const notificationId = parseInt(notification.id) || Math.floor(Math.random() * 10000);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: notification.title,
            body: notification.message,
            largeBody: notification.details || notification.message,
            summaryText: `${notification.type.toUpperCase()} Alert`,
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#488AFF',
            sound: 'beep.wav',
            attachments: [],
            actionTypeId: '',
            extra: {
              notificationId: notification.id,
              type: notification.type,
              timestamp: new Date().toISOString()
            },
            schedule: { at: new Date(Date.now() + 5000) }, // Show after 5 seconds
            channelId: 'factory-alerts'
          }
        ]
      });
      
      console.log('📤 Native local notification scheduled successfully:', {
        id: notificationId,
        title: notification.title
      });
    } catch (error) {
      console.error('❌ Error scheduling native local notification:', error);
    }
  }

  // Helper function to check if message is a heartbeat
  private isHeartbeat(data: any): boolean {
    return (
      data === 'heartbeat' ||
      data === 'ping' ||
      (typeof data === 'object' && (
        data.type === 'heartbeat' ||
        data.type === 'ping' ||
        data.message === 'heartbeat' ||
        data.message === 'ping'
      ))
    );
  }

  // Connect to SSE endpoint
  connect(url: string): void {
    if (this.eventSource) {
      this.disconnect();
    }

    this.connectionUrl.value = url;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('✅ SSE connection established');
      this.isConnected.value = true;
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        // Check if it's a heartbeat message first
        if (this.isHeartbeat(event.data)) {
          return; // Ignore heartbeat messages
        }

        const data: SSENotificationData = JSON.parse(event.data);
        
        // Double check parsed data for heartbeat
        if (this.isHeartbeat(data)) {
          return;
        }

        this.addNotification(data);
      } catch (error) {
        console.error('❌ Error parsing SSE data:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      this.isConnected.value = false;
      this.handleReconnect();
    };

    // Listen for specific event types
    this.eventSource.addEventListener('notification', (event) => {
      try {
        // Check if it's a heartbeat message first
        if (this.isHeartbeat(event.data)) {
          return; // Ignore heartbeat messages
        }

        const data: SSENotificationData = JSON.parse(event.data);
        
        // Double check parsed data for heartbeat
        if (this.isHeartbeat(data)) {
          return;
        }

        this.addNotification(data);
      } catch (error) {
        console.error('❌ Error parsing notification event:', error);
      }
    });

    this.eventSource.addEventListener('alert', (event) => {
      try {
        // Check if it's a heartbeat message first
        if (this.isHeartbeat(event.data)) {
          return; // Ignore heartbeat messages
        }

        const data: SSENotificationData = JSON.parse(event.data);
        
        // Double check parsed data for heartbeat
        if (this.isHeartbeat(data)) {
          return;
        }

        this.addNotification({ ...data, type: 'warning' });
      } catch (error) {
        console.error('❌ Error parsing alert event:', error);
      }
    });

    this.eventSource.addEventListener('success', (event) => {
      try {
        // Check if it's a heartbeat message first
        if (this.isHeartbeat(event.data)) {
          return; // Ignore heartbeat messages
        }

        const data: SSENotificationData = JSON.parse(event.data);
        
        // Double check parsed data for heartbeat
        if (this.isHeartbeat(data)) {
          return;
        }

        this.addNotification({ ...data, type: 'success' });
      } catch (error) {
        console.error('❌ Error parsing success event:', error);
      }
    });

    // Listen for heartbeat events and ignore them
    this.eventSource.addEventListener('heartbeat', (event) => {
      // Silently ignore heartbeat events
    });

    this.eventSource.addEventListener('ping', (event) => {
      // Silently ignore ping events
    });
  }

  // Disconnect from SSE
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected.value = false;
      console.log('🔌 SSE connection closed');
    }

    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  // Handle reconnection logic
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    this.reconnectAttempts++;

    console.log(`🔄 Attempting to reconnect in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectInterval = setTimeout(() => {
      if (this.connectionUrl.value) {
        this.connect(this.connectionUrl.value);
      }
    }, delay);
  }

  // Add a new notification
  private addNotification(data: SSENotificationData): void {
    const notification: Notification = {
      id: data.id || this.generateId(),
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      time: this.formatTime(new Date()),
      date: this.formatDate(new Date()),
      read: false,
      details: data.details,
      actions: data.actions,
      relatedInfo: data.relatedInfo
    };

    // Add to the beginning of the array (newest first)
    this.notifications.value.unshift(notification);

    // Always send local notification when receiving SSE events
    console.log('📥 New SSE notification received - triggering local notification:', notification.title);
    
    // Send push notification immediately (this will handle both native and web platforms)
    this.sendPushNotification(notification);

    console.log('📥 New notification added to list:', notification);
  }

  // Show browser notification
  private showBrowserNotification(notification: Notification): void {
    if (!('Notification' in window)) {
      console.warn('⚠️ Browser notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.png',
          badge: '/favicon.png',
          tag: notification.id,
          data: {
            notificationId: notification.id,
            type: notification.type,
            timestamp: new Date().toISOString()
          },
          requireInteraction: true, // Keep notification visible until user interacts
        });

        // Handle notification click
        browserNotification.onclick = () => {
          console.log('👆 Browser notification clicked:', notification.id);
          browserNotification.close();
          
          // Navigate to notification detail page
          console.log('🧭 Navigating to notification detail from browser:', notification.id);
          router.push(`/tabs/notification/${notification.id}`);
          
          // Focus the app window if possible
          if (window.focus) {
            window.focus();
          }
        };

        // Auto-close after 10 seconds if not interacted with
        setTimeout(() => {
          browserNotification.close();
        }, 10000);

        console.log('📤 Browser notification displayed successfully:', notification.title);
      } catch (error) {
        console.error('❌ Error showing browser notification:', error);
      }
    } else if (Notification.permission === 'default') {
      // Request permission and retry
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showBrowserNotification(notification);
        }
      });
    } else {
      console.warn('⚠️ Browser notification permission denied');
    }
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('⚠️ This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Mark notification as read
  markAsRead(id: string): void {
    const notification = this.notifications.value.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.value.forEach(notification => {
      notification.read = true;
    });
  }

  // Remove notification
  removeNotification(id: string): void {
    const index = this.notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.value.splice(index, 1);
    }
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications.value = [];
  }

  // Get notification by ID
  getNotificationById(id: string): Notification | undefined {
    return this.notifications.value.find(n => n.id === id);
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.value.filter(n => !n.read).length;
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private formatTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  // Getters for reactive data
  get allNotifications() {
    return this.notifications;
  }

  get connected() {
    return this.isConnected;
  }

  get currentUrl() {
    return this.connectionUrl;
  }

  // Test method to simulate incoming notifications
  simulateNotification(data?: Partial<SSENotificationData>): void {
    const mockData: SSENotificationData = {
      title: 'Test Notification',
      message: 'This is a simulated notification for testing',
      type: 'info',
      ...data
    };
    this.addNotification(mockData);
  }

  // Test method to verify heartbeat filtering
  testHeartbeatFiltering(): void {
    const initialCount = this.notifications.value.length;
    
    // Test various heartbeat formats
    const heartbeatTests = [
      'heartbeat',
      'ping',
      { type: 'heartbeat' },
      { type: 'ping' },
      { message: 'heartbeat' },
      { message: 'ping' }
    ];

    // Simulate heartbeat messages - these should NOT create notifications
    heartbeatTests.forEach(test => {
      if (this.isHeartbeat(test)) {
        console.log('✅ Correctly identified heartbeat:', test);
      } else {
        console.warn('⚠️ Failed to identify heartbeat:', test);
      }
    });

    // Add a real notification to verify normal functionality still works
    this.simulateNotification({
      title: 'Heartbeat Filter Test',
      message: 'This notification should appear after heartbeat filtering test'
    });

    const finalCount = this.notifications.value.length;
    console.log(`📊 Heartbeat filter test complete. Notifications before: ${initialCount}, after: ${finalCount} (should be +1)`);
  }

  // Test method to directly trigger native local notification with 5s delay
  async testNativeLocalNotification(data?: Partial<SSENotificationData>): Promise<void> {
    const mockData: SSENotificationData = {
      title: 'Test Native Local Notification',
      message: 'This is a test notification with 5-second delay',
      type: 'info',
      ...data
    };

    const notification: Notification = {
      id: this.generateId(),
      title: mockData.title,
      message: mockData.message,
      type: mockData.type || 'info',
      time: this.formatTime(new Date()),
      date: this.formatDate(new Date()),
      read: false,
      details: mockData.details,
      actions: mockData.actions,
      relatedInfo: mockData.relatedInfo
    };

    // Add to notifications list
    this.notifications.value.unshift(notification);

    // Send native local notification with 5s delay
    if (Capacitor.isNativePlatform()) {
      await this.sendNativeLocalNotification(notification);
      console.log('📤 Native local notification scheduled with 5-second delay');
    } else {
      // For web platform, show browser notification immediately
      this.showBrowserNotification(notification);
      console.log('📤 Browser notification shown immediately (web platform)');
    }
  }

  // Test method to verify notification navigation
  async testNotificationNavigation(data?: Partial<SSENotificationData>): Promise<void> {
    const notificationId = this.generateId();
    
    const mockData: SSENotificationData = {
      title: '🧭 Navigation Test Notification',
      message: 'Tap this notification to test navigation to detail page',
      type: 'info',
      details: `
        <p><strong>Navigation Test:</strong></p>
        <p>This notification is designed to test the navigation functionality.</p>
        <p>When you tap this notification, it should navigate directly to the notification detail page.</p>
        <p><strong>Expected Behavior:</strong></p>
        <ul>
          <li>Native platforms: Navigate to detail page when notification is tapped</li>
          <li>Web platform: Navigate to detail page when browser notification is clicked</li>
          <li>Notification should be marked as read automatically</li>
        </ul>
      `,
      ...data
    };

    const notification: Notification = {
      id: notificationId,
      title: mockData.title,
      message: mockData.message,
      type: mockData.type || 'info',
      time: this.formatTime(new Date()),
      date: this.formatDate(new Date()),
      read: false,
      details: mockData.details,
      actions: mockData.actions,
      relatedInfo: [
        { label: 'Test Type', value: 'Navigation Test' },
        { label: 'Platform', value: Capacitor.isNativePlatform() ? 'Native' : 'Web' },
        { label: 'Notification ID', value: notificationId },
        { label: 'Expected Route', value: `/tabs/notification/${notificationId}` },
        ...(mockData.relatedInfo || [])
      ]
    };

    // Add to notifications list
    this.notifications.value.unshift(notification);

    // Send notification based on platform
    if (Capacitor.isNativePlatform()) {
      await this.sendNativeLocalNotification(notification);
      console.log('📤 Navigation test notification scheduled for native platform');
    } else {
      this.showBrowserNotification(notification);
      console.log('📤 Navigation test notification shown for web platform');
    }

    console.log('🧭 Navigation test notification created:', {
      id: notificationId,
      expectedRoute: `/tabs/notification/${notificationId}`,
      platform: Capacitor.isNativePlatform() ? 'Native' : 'Web'
    });
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export for use in components
export { NotificationService };
