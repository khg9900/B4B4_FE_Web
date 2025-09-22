import { isSupported, getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';
import { api } from '../api/http';
import { logger } from '../utils/logger'; // ← 경로 조정

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
  try {
    const existing = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (existing) return existing;
    return await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  } catch (e) {
    logger.capture('FCM:ensureSw', e);
    return null;
  }
}

/**
 * 로그인 직후 호출:
 *  - 알림 권한 요청
 *  - FCM 토큰 발급
 *  - 서버 /devices 등록
 */
export async function registerDeviceAfterLogin(): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) return null;

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
      type: 'DESKTOP', // 웹은 DESKTOP로 통일(백엔드 enum 기준)
      os,
      osVersion,
      model,
      fcmToken: token,
    });

    return token;
  } catch (err) {
    logger.capture('FCM:registerDeviceAfterLogin', err);
    return null;
  }
}

/**
 * 앱 구동 시 1회 호출:
 *  - 탭 포그라운드 수신 메시지를 OS 알림으로 노출
 */
export async function initForegroundFcmListener() {
  try {
    const supported = await isSupported();
    if (!supported) return;

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
        logger.capture('FCM:showNotification', e, { title, body });
      }
    });
  } catch (e) {
    logger.capture('FCM:initForegroundFcmListener', e);
  }
}
