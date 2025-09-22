import { isSupported, getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';
import { api } from '../api/http';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY as string;

function detectDeviceOs(): 'ANDROID' | 'IOS' | 'WEB' {
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua)) return 'ANDROID';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'IOS';
  return 'WEB';
}

function getBrowserDeviceMeta() {
  const ua = navigator.userAgent || '';
  const model =
    (navigator as any).userAgentData?.brands?.map((b: any) => `${b.brand} ${b.version}`).join('; ') ||
    (navigator as any).vendor ||
    'web';
  const osVersion = ua;
  return { model, osVersion };
}

async function ensureSw(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  if (existing) return existing;
  return navigator.serviceWorker.register('/firebase-messaging-sw.js');
}

export async function registerDeviceAfterLogin(): Promise<string | null> {
  try {
    if (!(await isSupported())) {
      console.info('[FCM] not supported in this browser');
      return null;
    }

    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return null;

    const swReg = await ensureSw();
    if (!swReg) return null;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
    if (!token) return null;

    const os = detectDeviceOs();
    const { model, osVersion } = getBrowserDeviceMeta();

    await api.post('/devices', {
      type: 'DESKTOP',
      os,
      osVersion,
      model,
      fcmToken: token,
    });

    return token;
  } catch (err) {
    console.error('[FCM] registerDeviceAfterLogin error:', err);
    return null;
  }
}

export async function initForegroundFcmListener() {
  if (!(await isSupported())) return;

  const messaging = getMessaging(app);
  onMessage(messaging, async (payload) => {
    const title = payload.notification?.title ?? '알림';
    const body  = payload.notification?.body ?? '';
    const icon  = (payload.notification as any)?.icon;

    try {
      const reg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (reg) {
        await reg.showNotification(title, { body, icon });
      } else if (Notification.permission === 'granted') {
        new Notification(title, { body, icon });
      }
    } catch (e) {
      console.warn('[FCM] showNotification failed', e);
    }
  });
}
