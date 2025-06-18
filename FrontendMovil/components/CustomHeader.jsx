import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../config/theme";
import { typography } from "../config/typography";
export default function CustomHeader({ title, backRoute = "/(tabs)/company" }) {
  const router = useRouter();
  return React.createElement(
    View,
    { style: styles.customHeader },
    React.createElement(
      TouchableOpacity,
      {
        onPress: () => {
          if (typeof backRoute === "function") {
            backRoute();
          } else {
            router.push(backRoute);
          }
        },
        style: styles.backButton,
      },
      React.createElement(AntDesign, {
        name: "left",
        size: 22,
        color: colors.gray,
      })
    ),
    React.createElement(Text, { style: styles.headerTitle }, title),
    React.createElement(View, { style: styles.placeholder })
  );
}
const styles = StyleSheet.create({
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: Object.assign(
    Object.assign({ flex: 1 }, typography.medium.big),
    { color: colors.darkGray, textAlign: "center" }
  ),
  placeholder: {
    width: 45,
  },
});
