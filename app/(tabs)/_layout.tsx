import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#ffd33d',
      headerStyle: {
        backgroundColor: "#25292e",
      },
      headerShadowVisible: false,
      headerTintColor: "#fff",
      tabBarStyle: {
        backgroundColor: "#25292e",
      },
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Home', headerShown: true, tabBarIcon: ({ focused, color }) => (
          <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} />
        )
      }} />
      <Tabs.Screen name="about" options={{
        title: 'About', headerShown: true, tabBarIcon: ({ focused, color }) => (
          <Ionicons name={focused ? 'information-circle-sharp' : 'information-circle-outline'} color={color} />
        )
      }} />
    </Tabs>
  );
}
