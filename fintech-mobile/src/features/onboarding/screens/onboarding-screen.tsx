import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { PrimaryButton } from '@/components/ui/primary-button';
import { AppTheme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

const slides = [
  {
    id: 'control',
    title: 'Dòng tiền rõ trong một lần nhìn',
    description:
      'Theo dõi ví, giao dịch và biến động chi tiêu mà không cần nhảy qua quá nhiều màn hình.',
    gradient: AppTheme.gradients.onboardingA,
    image: require('../../../../assets/images/app-preview.png'),
  },
  {
    id: 'discipline',
    title: 'Gắn ngân sách, nợ và tiết kiệm với từng ví',
    description:
      'Mobile app được dựng để nhìn thấy ngay ví nào đang kéo tài chính đi xuống hoặc chạy đúng kế hoạch.',
    gradient: AppTheme.gradients.onboardingB,
    image: require('../../../../assets/images/onboarding2.png'),
  },
  {
    id: 'clarity',
    title: 'Thiết kế cho nhịp sử dụng thật trên điện thoại',
    description:
      'Bố cục đậm, gọn và tập trung vào những con số cần quyết định ngay trong ngày.',
    gradient: AppTheme.gradients.onboardingC,
    image: require('../../../../assets/images/onboarding3.png'),
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { markOnboardingSeen } = useAuth();
  const listRef = useRef<FlatList<(typeof slides)[number]>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === slides.length - 1;

  async function finishOnboarding() {
    await markOnboardingSeen(true);
    router.replace('/(auth)/login');
  }

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(nextIndex);
  }

  function goNext() {
    if (isLastSlide) {
      void finishOnboarding();
      return;
    }

    listRef.current?.scrollToIndex({ index: currentIndex + 1 });
    setCurrentIndex((value) => value + 1);
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={[styles.slide, { width }]}>
            <SafeAreaView style={styles.safeArea}>
              <TouchableOpacity onPress={() => void finishOnboarding()} style={styles.skipButton}>
                <Text style={styles.skipText}>Bỏ qua</Text>
              </TouchableOpacity>

              <View style={styles.content}>
                <View style={styles.imageWrap}>
                  <Image resizeMode="contain" source={item.image} style={styles.image} />
                </View>

                <View style={styles.copyWrap}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </View>

              <View style={styles.footer}>
                <View style={styles.pagination}>
                  {slides.map((slide, index) => (
                    <View
                      key={slide.id}
                      style={[styles.dot, index === currentIndex && styles.dotActive]}
                    />
                  ))}
                </View>

                <PrimaryButton
                  accessory={
                    <Ionicons color="#FFFFFF" name={isLastSlide ? 'rocket-outline' : 'arrow-forward'} size={18} />
                  }
                  label={isLastSlide ? 'Vào ứng dụng' : 'Tiếp theo'}
                  onPress={goNext}
                />
              </View>
            </SafeAreaView>
          </LinearGradient>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  skipButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: AppTheme.radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: AppTheme.fonts.bold,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  imageWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  image: {
    height: 260,
    width: '90%',
  },
  copyWrap: {
    gap: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 31,
    fontFamily: AppTheme.fonts.extrabold,
    lineHeight: 38,
  },
  description: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 15,
    fontFamily: AppTheme.fonts.regular,
    lineHeight: 24,
  },
  footer: {
    gap: 18,
    paddingBottom: 12,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: AppTheme.radii.pill,
    height: 8,
    width: 18,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 36,
  },
});
