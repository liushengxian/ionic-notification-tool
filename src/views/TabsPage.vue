<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="factory" href="/tabs/factory">
          <ion-icon aria-hidden="true" :icon="business" />
          <ion-label>Factory</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="notification" href="/tabs/notification">
          <ion-icon aria-hidden="true" :icon="notifications" />
          <ion-label>Notification</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="me" href="/tabs/me">
          <ion-icon aria-hidden="true" :icon="person" />
          <ion-label>Me</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { business, notifications, person } from 'ionicons/icons';
</script>
