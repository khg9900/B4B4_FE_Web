let loadingPromise: Promise<typeof window.kakao> | null = null;

export function loadKakaoMap(): Promise<typeof window.kakao> {
  if (typeof window === "undefined") return Promise.reject(new Error("window 없음"));
  if (window.kakao?.maps?.LatLng) return Promise.resolve(window.kakao);

  if (!loadingPromise) {
    loadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      // 브라우저 환경에서는 process.env 대신 import.meta.env (Vite) 또는 REACT_APP_… 사용
      const appKey = import.meta.env.VITE_KAKAO_APP_KEY;
      // CRA: const appKey = process.env.REACT_APP_KAKAO_APP_KEY;

      if (!appKey) return reject(new Error("Kakao 앱 키가 없습니다"));

      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
      script.async = true;

      script.onload = () => {
        if (window.kakao?.maps?.load) {
          window.kakao.maps.load(() => resolve(window.kakao));
        } else {
          reject(new Error("Kakao SDK 로드 실패"));
        }
      };

      script.onerror = () => reject(new Error("Kakao SDK 로드 실패"));
      document.head.appendChild(script);
    });
  }

  return loadingPromise;
}

export async function searchPlace(keyword: string) {
  const kakao = await loadKakaoMap();

  return new Promise<any[]>((resolve, reject) => {
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK) resolve(data);
      else if (status === kakao.maps.services.Status.ZERO_RESULT) resolve([]);
      else reject(new Error("검색 실패: " + status));
    });
  });
}