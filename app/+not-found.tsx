import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFound() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops! Not Found.' }} />
            <View style={styles.container}>
                <Link style={styles.link} href="/">Go back to home page</Link>
            </View>
        </>
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