import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LocationService } from '../services/LocationService';
import { CountryData, CityData, LocationData } from '../services/ManualLocationService';

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (location: LocationData) => void;
  currentLocation?: LocationData | null;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  visible,
  onClose,
  onLocationSelected,
  currentLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'country' | 'city'>('country');
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [cities, setCities] = useState<CityData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      // تحميل جميع البلدان عند فتح النافذة
      setCountries(LocationService.getAllCountries());
      setSearchQuery('');
      setSelectedCountry(null);
      setCities([]);
      setSearchType('country');
    }
  }, [visible]);

  useEffect(() => {
    if (searchType === 'country') {
      // البحث في البلدان
      const filteredCountries = LocationService.searchCountries(searchQuery);
      setCountries(filteredCountries);
    } else if (searchType === 'city' && selectedCountry) {
      // البحث في مدن البلد المحدد
      const filteredCities = LocationService.searchCities(searchQuery, selectedCountry.code);
      setCities(filteredCities);
    }
  }, [searchQuery, searchType, selectedCountry]);

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    setSearchType('city');
    setSearchQuery('');
    setCities(LocationService.getCitiesByCountry(country.code));
  };

  const handleCitySelect = (city: CityData) => {
    const locationData = LocationService.cityToLocationData(city);
    onLocationSelected(locationData);
    onClose();
  };

  const handleBackToCountries = () => {
    setSearchType('country');
    setSelectedCountry(null);
    setSearchQuery('');
    setCities([]);
    setCountries(LocationService.getAllCountries());
  };

  const renderCountryItem = ({ item }: { item: CountryData }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleCountrySelect(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.nameAr}</Text>
        <Text style={styles.itemSubtitle}>{item.name}</Text>
      </View>
      <Text style={styles.itemCode}>{item.code}</Text>
    </TouchableOpacity>
  );

  const renderCityItem = ({ item }: { item: CityData }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleCitySelect(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.nameAr}</Text>
        <Text style={styles.itemSubtitle}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>إلغاء</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>
            {searchType === 'country' ? 'اختر البلد' : 'اختر المدينة'}
          </Text>
          
          {searchType === 'city' && (
            <TouchableOpacity onPress={handleBackToCountries} style={styles.backButton}>
              <Text style={styles.backButtonText}>رجوع</Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedCountry && searchType === 'city' && (
          <View style={styles.selectedCountryContainer}>
            <Text style={styles.selectedCountryText}>
              البلد المحدد: {selectedCountry.nameAr}
            </Text>
          </View>
        )}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={
              searchType === 'country' 
                ? 'ابحث عن البلد...' 
                : 'ابحث عن المدينة...'
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <FlatList
          data={searchType === 'country' ? countries : cities}
          renderItem={searchType === 'country' ? renderCountryItem : renderCityItem}
          keyExtractor={(item, index) => `${searchType}-${index}`}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchType === 'country' 
                  ? 'لا توجد بلدان مطابقة للبحث'
                  : 'لا توجد مدن مطابقة للبحث'
                }
              </Text>
            </View>
          }
        />

        {currentLocation && (
          <View style={styles.currentLocationContainer}>
            <Text style={styles.currentLocationLabel}>الموقع الحالي:</Text>
            <Text style={styles.currentLocationText}>
              {currentLocation.city}, {currentLocation.country}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedCountryContainer: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectedCountryText: {
    fontSize: 14,
    color: '#2980b9',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'right',
  },
  list: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  itemContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'right',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
    textAlign: 'right',
  },
  itemCode: {
    fontSize: 12,
    color: '#95a5a6',
    fontWeight: '500',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  currentLocationContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  currentLocationLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  currentLocationText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
});