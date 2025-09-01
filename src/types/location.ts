export interface Location {
province: string; // 시/도 (region_1depth_name)
city: string; // 시/군/구 (region_2depth_name)
placeName: string; // 동/읍/면 or 전체 주소명
latitude: string; // 위도 문자열 (폼 연동 편의)
longitude: string; // 경도 문자열 (폼 연동 편의)
}