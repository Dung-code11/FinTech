import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const isTablet = width >= 768;
const isSmallPhone = height <= 700;

const onboardingData = [
  {
    id: '1',
    title: 'Quản lý chi tiêu thông minh',
    description:
      'Theo dõi mọi khoản chi tiêu một cách dễ dàng và tự động phân loại',
    gradient: ['#667eea', '#764ba2'],
    image: require('../../assets/images/app-preview.png'),
  },
  {
    id: '2',
    title: 'Tiết kiệm & Đầu tư',
    description: 'Đặt mục tiêu tài chính và nhận gợi ý đầu tư thông minh',
    gradient: ['#f093fb', '#f5576c'],
    image: require('../../assets/images/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Bảo mật tuyệt đối',
    description: 'Mã hóa 256-bit, bảo vệ thông tin tài chính của bạn',
    gradient: ['#4facfe', '#00f2fe'],
    image: require('../../assets/images/onboarding3.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const hintAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(hintAnim, {
          toValue: 10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(hintAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGetStarted = async () => {
    try {
      // Lưu trạng thái đã xem onboarding
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(auth)/login');
    }
  };

  const onScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item, index }: any) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, 30],
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
    });

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.top}>
              <Animated.View
                style={[
                  styles.imageWrapper,
                  { transform: [{ scale }], opacity },
                ]}
              >
                <Image source={item.image} style={styles.image} resizeMode="contain" />
              </Animated.View>

              <Animated.View
                style={[
                  styles.textWrapper,
                  { transform: [{ translateY }], opacity },
                ]}
              >
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </Animated.View>
            </View>

            <View style={styles.bottom}>
              {index === 0 && (
                <Animated.Text
                  style={[
                    styles.swipeHint,
                    { transform: [{ translateX: hintAnim }] },
                  ]}
                >
                  Vuốt sang để khám phá →
                </Animated.Text>
              )}

              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#FFD166', '#FFB347']}
                  style={styles.gradientButton}
                >
                  <Text style={styles.getStartedText}>Bắt đầu ngay</Text>
                  <Ionicons name="rocket-outline" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <AnimatedFlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    height,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 30 : 40,
  },
  top: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  bottom: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  imageWrapper: {
    width: Math.min(width * 0.5, 240),
    height: Math.min(width * 0.5, 240),
    marginBottom: isSmallPhone ? 16 : 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: isTablet ? 32 : 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: isTablet ? 42 : 34,
  },
  description: {
    fontSize: isTablet ? 17 : 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: isTablet ? 26 : 22,
    paddingHorizontal: 16,
  },
  swipeHint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginBottom: 16,
  },
  getStartedButton: {
    width: Math.min(width * 0.7, 280),
    borderRadius: 100,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallPhone ? 12 : 14,
    gap: 8,
  },
  getStartedText: {
    fontSize: isSmallPhone ? 14 : 16,
    fontWeight: '700',
    color: '#fff',
  },
});