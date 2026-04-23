import { Brand } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

export interface AutocompleteItem {
  id: string;
  name: string;
  metadata?: any;
}

interface AppAutocompleteProps extends Omit<TextInputProps, "onChangeText"> {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  onSelect: (item: AutocompleteItem) => void;
  fetchSuggestions: (query: string) => Promise<AutocompleteItem[]>;
  error?: string;
  minSearchLength?: number;
  debounceMs?: number;
  allowCustom?: boolean;
  customLabel?: string;
}

export function AppAutocomplete({
  label,
  placeholder,
  value,
  onChangeText,
  onSelect,
  fetchSuggestions,
  error,
  minSearchLength = 2,
  debounceMs = 300,
  allowCustom = true,
  customLabel = "Not listed? Add manually",
  ...props
}: AppAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if below min length or not focused
    if (!focused || value.length < minSearchLength) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Debounce the search
    debounceTimerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchSuggestions(value);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error("Autocomplete search error:", err);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, focused, minSearchLength, debounceMs, fetchSuggestions]);

  const handleSelect = (item: AutocompleteItem) => {
    onSelect(item);
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  const handleManualEntry = () => {
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  const handleToggleDropdown = async () => {
    if (showDropdown) {
      // Close dropdown
      setShowDropdown(false);
    } else {
      // Open dropdown and fetch all results
      setLoading(true);
      try {
        const results = await fetchSuggestions("");
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            // Delay hiding dropdown to allow tap on items
            setTimeout(() => setShowDropdown(false), 200);
          }}
          {...props}
        />
        {!loading && (
          <TouchableOpacity
            onPress={handleToggleDropdown}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dropdownIcon}>
              {showDropdown ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>
        )}
        {loading && <ActivityIndicator size="small" color={Brand.primary} />}
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {/* Dropdown */}
      {showDropdown && (focused || suggestions.length > 0) && (
        <View style={styles.dropdown}>
          <ScrollView
            nestedScrollEnabled={true}
            style={{ maxHeight: 200 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={suggestions.length > 5}
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {allowCustom && (
            <TouchableOpacity
              style={styles.customOption}
              onPress={handleManualEntry}
              activeOpacity={0.7}
            >
              <Text style={styles.customOptionText}>➕ {customLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: {
    borderColor: Brand.primary,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  dropdown: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  suggestionText: {
    fontSize: 14,
    color: "#334155",
  },
  customOption: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  customOptionText: {
    fontSize: 13,
    color: Brand.primary,
    fontWeight: "600",
  },
  dropdownIcon: {
    fontSize: 14,
    color: Brand.primary,
    fontWeight: "700",
    marginLeft: 8,
  },
});
