import { Stack } from "expo-router";
import React from "react";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{}}
      />
      <Stack.Screen
        name="setup"
        options={{}}
      />
      <Stack.Screen
        name="document-vault"
        options={{}}
      />
    </Stack>
  );
}
