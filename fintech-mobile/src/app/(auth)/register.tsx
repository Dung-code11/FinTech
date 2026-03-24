// app/(auth)/register.tsx
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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../../constants/colors";
import api from "../../services/api";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthday, setBirthday] = useState<Date>(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sex, setSex] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const genders = ["Nam", "Nữ", "Khác"];

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  const handleRegister = async () => {
    // Validate
    if (!username || !fullname || !email || !phone || !password || !confirmPassword || !sex || !address) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      Alert.alert("Lỗi", "Số điện thoại phải có 10 chữ số");
      return;
    }

    const registerData = {
      username: username.trim(),
      password: password,
      fullname: fullname.trim(),
      birthday: formatDateForAPI(birthday),
      sex: sex,
      address: address.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    };

    console.log("📤 Sending data:", registerData);

    setLoading(true);
    try {
      const response = await api.post("/auth/register", registerData);
      console.log("✅ Response:", response.data);
      
      Alert.alert(
        "Đăng ký thành công",
        "Vui lòng đăng nhập để tiếp tục",
        [
          {
            text: "Đăng nhập ngay",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Register error:", error);
      
      if (error.response?.status === 400) {
        Alert.alert(
          "Lỗi dữ liệu",
          error.response?.data?.message || "Dữ liệu gửi lên không hợp lệ"
        );
      } else if (error.message === "Network Error") {
        Alert.alert(
          "Lỗi kết nối",
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối"
        );
      } else {
        Alert.alert("Lỗi", error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại sau");
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
            {/* Logo */}
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
                  <Ionicons name="person-add-outline" size={50} color="#fff" />
                </LinearGradient>
              </View>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Tạo tài khoản mới 🚀</Text>
              <Text style={styles.subtitle}>Đăng ký để trải nghiệm FinTech</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Tên đăng nhập */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Tên đăng nhập *"
                  placeholderTextColor={Colors.gray400}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              {/* Họ và tên */}
              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Họ và tên *"
                  placeholderTextColor={Colors.gray400}
                  value={fullname}
                  onChangeText={setFullname}
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Email *"
                  placeholderTextColor={Colors.gray400}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Số điện thoại */}
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại * (10 số)"
                  placeholderTextColor={Colors.gray400}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              {/* Mật khẩu */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu * (ít nhất 6 ký tự)"
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

              {/* Xác nhận mật khẩu */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Xác nhận mật khẩu *"
                  placeholderTextColor={Colors.gray400}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.gray400}
                  />
                </TouchableOpacity>
              </View>

              {/* Ngày sinh - Date Picker */}
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={[styles.input, { color: birthday ? Colors.gray800 : Colors.gray400 }]}>
                  {birthday ? formatDate(birthday) : "Chọn ngày sinh *"}
                </Text>
                <Ionicons name="chevron-down-outline" size={20} color={Colors.gray400} />
              </TouchableOpacity>

              {/* DateTimePicker Modal */}
              {showDatePicker && (
                <DateTimePicker
                  value={birthday}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}

              {/* Giới tính */}
              <View style={styles.inputContainer}>
                <Ionicons name="transgender-outline" size={20} color={Colors.primary} />
                <TouchableOpacity 
                  style={styles.genderSelector}
                  onPress={() => setShowGenderPicker(!showGenderPicker)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.input, { color: sex ? Colors.gray800 : Colors.gray400 }]}>
                    {sex || "Chọn giới tính *"}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color={Colors.gray400} />
                </TouchableOpacity>
              </View>

              {/* Gender Picker Modal */}
              {showGenderPicker && (
                <Modal
                  transparent
                  animationType="fade"
                  visible={showGenderPicker}
                  onRequestClose={() => setShowGenderPicker(false)}
                >
                  <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowGenderPicker(false)}
                  >
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chọn giới tính</Text>
                        <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                          <Ionicons name="close" size={24} color={Colors.gray600} />
                        </TouchableOpacity>
                      </View>
                      {genders.map((item) => (
                        <TouchableOpacity
                          key={item}
                          style={styles.genderOption}
                          onPress={() => {
                            setSex(item);
                            setShowGenderPicker(false);
                          }}
                        >
                          <Text style={styles.genderOptionText}>{item}</Text>
                          {sex === item && (
                            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}

              {/* Địa chỉ */}
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Địa chỉ *"
                  placeholderTextColor={Colors.gray400}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
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
                    <Text style={styles.registerButtonText}>Đăng ký</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.signinText}> Đăng nhập</Text>
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
    paddingTop: 20,
  },
  logoSection: {
    alignItems: "center",
    position: "relative",
    marginBottom: 20,
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
    width: 80,
    height: 80,
    borderRadius: 40,
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
    marginBottom: 24,
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
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
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
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: Colors.gray800,
  },
  genderSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray800,
  },
  genderOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  genderOptionText: {
    fontSize: 16,
    color: Colors.gray700,
  },
  registerButton: {
    borderRadius: 100,
    overflow: "hidden",
    marginTop: 10,
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
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: Colors.gray600,
  },
  signinText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});