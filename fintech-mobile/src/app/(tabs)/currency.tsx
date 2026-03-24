import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import api from '../../services/api';

const currencies = [
  { code: 'USD', name: 'Đô la Mỹ', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 1.08 },
  { code: 'GBP', name: 'Bảng Anh', symbol: '£', rate: 1.27 },
  { code: 'JPY', name: 'Yên Nhật', symbol: '¥', rate: 0.0067 },
  { code: 'VND', name: 'Việt Nam Đồng', symbol: '₫', rate: 0.00004 },
  { code: 'CNY', name: 'Nhân dân tệ', symbol: '¥', rate: 0.14 },
  { code: 'KRW', name: 'Won Hàn Quốc', symbol: '₩', rate: 0.00075 },
  { code: 'SGD', name: 'Đô la Singapore', symbol: 'S$', rate: 0.74 },
  { code: 'AUD', name: 'Đô la Úc', symbol: 'A$', rate: 0.66 },
  { code: 'CAD', name: 'Đô la Canada', symbol: 'C$', rate: 0.74 },
];

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VND');
  const [result, setResult] = useState(0);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    convertCurrency();
  }, [amount, fromCurrency, toCurrency]);

  const getRate = (code) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.rate || 1;
  };

  const convertCurrency = () => {
    const fromRate = getRate(fromCurrency);
    const toRate = getRate(toCurrency);
    const converted = (parseFloat(amount || '0') / fromRate) * toRate;
    setResult(converted);
  };

  const formatCurrency = (value, currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return `${currency?.symbol || ''}${value.toFixed(2)}`;
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const CurrencyPicker = ({ visible, onClose, onSelect, currentCode }) => {
    if (!visible) return null;
    
    return (
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContent}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Chọn loại tiền</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.gray600} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {currencies.map(currency => (
              <TouchableOpacity
                key={currency.code}
                style={[styles.pickerItem, currentCode === currency.code && styles.pickerItemActive]}
                onPress={() => {
                  onSelect(currency.code);
                  onClose();
                }}
              >
                <Text style={styles.pickerItemCode}>{currency.code}</Text>
                <Text style={styles.pickerItemName}>{currency.name}</Text>
                {currentCode === currency.code && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.converterCard}>
      <Text style={styles.converterTitle}>Chuyển đổi tiền tệ</Text>
      
      <View style={styles.converterInput}>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
        />
        
        <TouchableOpacity 
          style={styles.currencySelector}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={styles.currencyCode}>{fromCurrency}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.gray600} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
        <Ionicons name="swap-vertical" size={24} color={Colors.primary} />
      </TouchableOpacity>

      <View style={styles.converterInput}>
        <Text style={styles.resultAmount}>{formatCurrency(result, toCurrency)}</Text>
        
        <TouchableOpacity 
          style={styles.currencySelector}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={styles.currencyCode}>{toCurrency}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.gray600} />
        </TouchableOpacity>
      </View>

      <Text style={styles.rateInfo}>
        1 {fromCurrency} = {formatCurrency(getRate(toCurrency) / getRate(fromCurrency), toCurrency)}
      </Text>

      <CurrencyPicker
        visible={showFromPicker}
        onClose={() => setShowFromPicker(false)}
        onSelect={setFromCurrency}
        currentCode={fromCurrency}
      />
      <CurrencyPicker
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSelect={setToCurrency}
        currentCode={toCurrency}
      />
    </View>
  );
};

const ExchangeRate = ({ currency }) => {
  return (
    <View style={styles.rateCard}>
      <View style={styles.rateHeader}>
        <Text style={styles.rateCurrency}>{currency.code}</Text>
        <Text style={styles.rateName}>{currency.name}</Text>
      </View>
      <Text style={styles.rateValue}>
        1 USD = {formatCurrency(1 / currency.rate, currency.code)}
      </Text>
      <Text style={styles.rateUpdate}>Cập nhật: Hôm nay</Text>
    </View>
  );
};

const formatCurrency = (value, code) => {
  const currency = currencies.find(c => c.code === code);
  return `${currency?.symbol || ''}${value.toFixed(2)}`;
};

export default function CurrencyToolsScreen() {
  const [exchangeRates, setExchangeRates] = useState(currencies);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExchangeRates();
  }, []);

  const loadExchangeRates = async () => {
    setLoading(true);
    try {
      // Giả lập API call
      setTimeout(() => {
        setExchangeRates(currencies);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Load rates error:', error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Converter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Công cụ chuyển đổi</Text>
          <CurrencyConverter />
        </View>

        {/* Exchange Rates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tỷ giá hôm nay</Text>
            <TouchableOpacity onPress={loadExchangeRates}>
              <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Đang cập nhật tỷ giá...</Text>
            </View>
          ) : (
            <View style={styles.ratesGrid}>
              {exchangeRates.map(currency => (
                <ExchangeRate key={currency.code} currency={currency} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray800,
  },
  converterCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  converterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray700,
    marginBottom: 20,
    textAlign: 'center',
  },
  converterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '500',
    color: Colors.gray800,
    padding: 0,
  },
  resultAmount: {
    flex: 1,
    fontSize: 24,
    fontWeight: '500',
    color: Colors.primary,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: Colors.gray200,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray800,
  },
  swapButton: {
    alignSelf: 'center',
    backgroundColor: Colors.gray50,
    padding: 8,
    borderRadius: 30,
    marginVertical: 8,
  },
  rateInfo: {
    fontSize: 12,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: 16,
  },
  ratesGrid: {
    gap: 12,
    paddingBottom: 100,
  },
  rateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rateCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray800,
  },
  rateName: {
    fontSize: 12,
    color: Colors.gray500,
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray700,
    marginBottom: 4,
  },
  rateUpdate: {
    fontSize: 10,
    color: Colors.gray400,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 12,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray800,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  pickerItemActive: {
    backgroundColor: Colors.primarySoft,
  },
  pickerItemCode: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray800,
    width: 60,
  },
  pickerItemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray600,
  },
});