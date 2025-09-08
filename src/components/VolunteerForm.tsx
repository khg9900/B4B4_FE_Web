import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const CONTENT_HEIGHT = 72;   // 헤더 본문(아이콘 들어가는 줄) 높이 고정
const ICON_SIZE = 56;        // 아이콘 크기 고정(dp) - 필요시 숫자만 조정

const Header = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // 어떤 기기든 상단 여백을 동일하게 확보
  const topSafe = insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);

  return (
    <View style={styles.safeWrap}>
      {/* 안전영역 전용 spacer: 기기별 status bar 차이 흡수 */}
      <View style={{ height: topSafe }} />

      {/* 실제 헤더 행: 중앙 정렬 고정 */}
      <View style={styles.row}>
        <TouchableOpacity style={{ marginTop: -32 }}>
          <Image source={require('../img/b4b4.png')} style={styles.icon} />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={{ marginTop: -22 }} onPress={() => navigation.navigate('Alert' as never)}>
          <Image source={require('../img/alertoff.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeWrap: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  row: {
    height: CONTENT_HEIGHT,         // 행 높이 고정 → 중앙 정렬 기준 불변
    flexDirection: 'row',
    alignItems: 'center',           // 수직 중앙
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  icon: {
    width: ICON_SIZE,               // 크기 고정(dp)
    height: ICON_SIZE,
    resizeMode: 'contain',
  },
});

export default Header;
