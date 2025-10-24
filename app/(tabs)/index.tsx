import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
  link: {
    color: "gray",
    marginTop: 16,
    padding: 5,
    borderWidth: 0.1,
    borderColor: '#fff',
    borderRadius: 5,
    fontSize: 20,
    textDecorationLine: 'underline'
  }
})