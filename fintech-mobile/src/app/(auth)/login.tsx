// app/(auth)/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        login: login,
        password: password,
      });

      const { accessToken, userId, username, role } = response.data;

      // Lưu token và thông tin user
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("userId", userId);
      await AsyncStorage.setItem("username", username);
      await AsyncStorage.setItem("role", role);

      console.log("Login successful:", { userId, username, role });
      
      // Chuyển đến màn hình chính
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.response) {
        // Server trả về lỗi
        Alert.alert(
          "Đăng nhập thất bại",
          error.response.data?.message || "Sai tên đăng nhập hoặc mật khẩu"
        );
      } else if (error.request) {
        // Không nhận được phản hồi
        Alert.alert("Lỗi kết nối", "Không thể kết nối đến server");
      } else {
        // Lỗi khác
        Alert.alert("Lỗi", "Đã xảy ra lỗi, vui lòng thử lại sau");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f5f7fa', '#ffffff', '#f0f4f8']}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Logo + Decorative Elements */}
            <View style={styles.logoSection}>
              <View style={styles.decoCircle1} />
              <View style={styles.decoCircle2} />
              
              <View style={styles.logoWrapper}>
                <LinearGradient
                  colors={['#1976d2', '#64b5f6']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="wallet-outline" size={50} color="#fff" />
                </LinearGradient>
              </View>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Chào mừng trở lại 👋</Text>
              <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Tên đăng nhập / Email"
                  placeholderTextColor={Colors.gray400}
                  value={login}
                  onChangeText={setLogin}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.primary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  placeholderTextColor={Colors.gray400}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.gray400}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>Đăng nhập</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.signupText}> Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",
  },
  logoSection: {
    alignItems: "center",
    position: "relative",
  },
  decoCircle1: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(25, 118, 210, 0.05)",
    top: -50,
    right: -50,
  },
  decoCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(100, 181, 246, 0.03)",
    bottom: -80,
    left: -80,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 12,
  },
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.gray800,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray500,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.gray800,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  loginButton: {
    borderRadius: 100,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.gray600,
  },
  signupText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});