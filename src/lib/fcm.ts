// src/lib/fcm.ts
import { isSupported, getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';
import { api } from '../api/http';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY as string;

/** 백엔드 enum에 맞춘 OS 매핑 */
function detectDeviceOs(): 'ANDROID' | 'IOS' | 'WEB' {
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua)) return 'ANDROID';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'IOS';
  return 'WEB';
}

/** 브라우저/디바이스 메타 */
function getBrowserDeviceMeta() {
  const ua = navigator.userAgent || '';
  const model =
    (navigator as any).userAgentData?.brands?.map((b: any) => `${b.brand} ${b.version}`).join('; ') ||
    (navigator as any).vendor ||
    'web';
  const osVersion = ua; // 간단히 UA 전체를 버전 문자열로 사용
  return { model, osVersion };
}

/** SW 보장(이미 등록돼 있으면 재사용) */
async function ensureSw(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  if (existing) return existing;
  return navigator.serviceWorker.register('/firebase-messaging-sw.js');
}

/**
 * 로그인 직후 호출:
 *  - 알림 권한 요청
 *  - FCM 토큰 발급
 *  - 서버 /devices 등록
 */
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
      type: 'DESKTOP', // 웹은 DESKTOP로 통일(백엔드 enum 기준)
      os,              // 'WEB' | 'ANDROID' | 'IOS'
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

/**
 * 앱 구동 시 1회 호출:
 *  - 탭이 활성(포그라운드)일 때 수신되는 메시지 처리
 *  - 서비스워커를 통해 OS 알림을 띄워 배경과 동일 UX 제공
 */
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
        // OS 알림(포그라운드에서도 동일하게)
        await reg.showNotification(title, { body, icon });
      } else if (Notification.permission === 'granted') {
        // 매우 드문 경우: SW 없으면 페이지에서 직접
        new Notification(title, { body, icon });
      }
    } catch (e) {
      console.warn('[FCM] showNotification failed', e);
    }
  });
}
