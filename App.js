// App.js
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Circle } from "react-native-maps";

// -------------------- Home Screen --------------------
function HomeScreen({ navigation, reports, setReports }) {
  const upvoteReport = (id) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r))
    );
  };
  const downvoteReport = (id) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: (r.upvotes || 0) - 1 } : r))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FixMyCity 🏙️</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("AdminLogin")}
          >
            <Ionicons name="shield-checkmark" size={20} color="#fff" />
            <Text style={styles.iconButtonText}>Admin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => navigation.navigate("Report")}
          >
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ marginTop: 20, textAlign: "center", color: "#555" }}>
            No reports yet — be the first! 🚀
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("Detail", {
                report: item,
                setReports,
                isAdmin: false,
              })
            }
          >
            {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.thumb} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.desc}>
                {item.type} — {item.description}
              </Text>
              <Text style={styles.meta}>
                Status: {item.status} • Upvotes: {item.upvotes}
              </Text>
              {item.location ? (
                <Text style={{ color: "#666", fontSize: 12 }}>
                  {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}
                </Text>
              ) : null}
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={() => upvoteReport(item.id)} style={{ marginLeft: 10 }}>
                <Ionicons name="thumbs-up" size={24} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => downvoteReport(item.id)} style={{ marginLeft: 6 }}>
                <Ionicons name="thumbs-down" size={24} color="#ff3b30" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// -------------------- Report Screen --------------------
function ReportScreen({ navigation, addReport }) {
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Pothole");
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.6,
      });
      if (result && (result.uri || result.assets)) {
        const uri = result.uri ?? (result.assets && result.assets[0] && result.assets[0].uri);
        setImageUri(uri);
      }
    } catch (err) {
      Alert.alert("Camera error", err.message || String(err));
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required to tag the report.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      Alert.alert(
        "Location captured",
        `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`
      );
    } catch (err) {
      Alert.alert("Location error", err.message || String(err));
    }
  };

  const submit = () => {
    if (!description.trim()) {
      Alert.alert("Add description", "Please add a short description of the issue.");
      return;
    }
    const newReport = {
      id: Date.now().toString(),
      description: description.trim(),
      type,
      location,
      imageUri,
      status: "Submitted",
      upvotes: 0,
      comments: [],
      timestamp: Date.now(),
    };
    addReport(newReport);
    navigation.navigate("Home");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.label}>Issue Type</Text>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {["Pothole", "Streetlight", "Garbage", "Other"].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeButton, type === t && styles.typeButtonActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeText, type === t && { color: "#fff" }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Short Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. big pothole near school"
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10 }}>
            <Button title="Take Photo" onPress={pickImage} color="#007bff" />
            <Button title="Use My Location" onPress={getLocation} color="#4CAF50" />
          </View>

          {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 120, marginVertical: 10, borderRadius: 8 }} />}
          {location && <Text>Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</Text>}

          <View style={{ marginTop: 20 }}>
            <Button title="Submit Report" onPress={submit} color="#ff5722" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// -------------------- Detail Screen --------------------
function DetailScreen({ route }) {
  const { report, setReports, isAdmin = false } = route.params;
  const [newComment, setNewComment] = useState("");

  const changeStatus = () => {
    const nextStatus =
      report.status === "Submitted"
        ? "In Progress"
        : report.status === "In Progress"
        ? "Resolved"
        : "Submitted";
    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, status: nextStatus } : r))
    );
  };

  const upvoteComment = (index) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === report.id) {
          const newComments = [...r.comments];
          newComments[index].upvotes = (newComments[index].upvotes || 0) + 1;
          return { ...r, comments: newComments };
        }
        return r;
      })
    );
  };

  const downvoteComment = (index) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === report.id) {
          const newComments = [...r.comments];
          newComments[index].downvotes = (newComments[index].downvotes || 0) + 1;
          return { ...r, comments: newComments };
        }
        return r;
      })
    );
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === report.id) {
          const newComments = [...r.comments, { text: newComment.trim(), upvotes: 0, downvotes: 0 }];
          return { ...r, comments: newComments };
        }
        return r;
      })
    );
    setNewComment("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{report.type}</Text>
      {report.imageUri && <Image source={{ uri: report.imageUri }} style={{ width: "100%", height: 200, marginTop: 10, borderRadius: 10 }} />}
      <Text style={{ marginTop: 10 }}>{report.description}</Text>
      <Text style={{ marginTop: 6 }}>Status: {report.status}</Text>
      <Text style={{ marginTop: 6 }}>
        Location: {report.location ? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}` : "Not provided"}
      </Text>

      {isAdmin && report.status !== "Resolved" && (
        <TouchableOpacity style={styles.statusButton} onPress={changeStatus}>
          <Text style={styles.statusButtonText}>Change Status 🔄</Text>
        </TouchableOpacity>
      )}

      {/* Comments Section */}
      <Text style={[styles.label, { marginTop: 20 }]}>Comments</Text>
      {report.comments.length === 0 ? (
        <Text>No comments yet. Be first! 🚀</Text>
      ) : (
        report.comments.map((c, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
            <Text style={{ flex: 1 }}>{c.text}</Text>
            <TouchableOpacity onPress={() => upvoteComment(i)} style={{ marginHorizontal: 4 }}>
              <Ionicons name="thumbs-up" size={20} color="#007bff" />
              <Text>{c.upvotes || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => downvoteComment(i)} style={{ marginHorizontal: 4 }}>
              <Ionicons name="thumbs-down" size={20} color="#ff3b30" />
              <Text>{c.downvotes || 0}</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Add New Comment */}
      <View style={{ flexDirection: "row", marginTop: 12, alignItems: "center" }}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity onPress={addComment} style={[styles.smallBtn, { backgroundColor: "#4CAF50" }]}>
          <Text style={styles.smallBtnText}>Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// -------------------- Admin Login --------------------
function AdminLogin({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const passwordRef = useRef(null);

  const attemptLogin = () => {
    if (username === "superuser" && password === "bigfella") {
      navigation.replace("AdminDashboard");
    } else {
      Alert.alert("Login failed", "Incorrect credentials");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.title, { marginBottom: 12 }]}>Admin Login</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
        blurOnSubmit={false}
      />

      <Text style={styles.label}>Password</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          ref={passwordRef}
          style={[styles.input, { flex: 1 }]}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry={!showPass}
          returnKeyType="done"
          onSubmitEditing={attemptLogin}
        />
        <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ marginLeft: 8 }}>
          <Ionicons name={showPass ? "eye-off" : "eye"} size={24} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 12 }}>
        <Button title="Login" onPress={attemptLogin} color="#333" />
      </View>
    </SafeAreaView>
  );
}

// -------------------- Admin Dashboard --------------------
function AdminDashboard({ navigation, reports, setReports }) {
  const mapRef = useRef(null);

  const changeStatus = (id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status:
                r.status === "Submitted"
                  ? "In Progress"
                  : r.status === "In Progress"
                  ? "Resolved"
                  : "Submitted",
            }
          : r
      )
    );
  };

  const focusOnReport = (r) => {
    if (r.location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: r.location.lat,
          longitude: r.location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    } else {
      Alert.alert("No location", "This report has no location data.");
    }
  };

  const heatCircles = reports
    .filter((r) => r.location && r.status !== "Resolved")
    .map((r) => {
      const base = Math.max(100, (r.upvotes || 0) * 150 + 200);
      const opacity = Math.min(0.5, 0.15 + Math.min(1, (r.upvotes || 0) * 0.1));
      const color = r.status === "In Progress" ? `rgba(255,165,0,${opacity})` : `rgba(255,0,0,${opacity})`;
      return { id: r.id, lat: r.location.lat, lng: r.location.lng, radius: base, color };
    });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1, borderRadius: 10, marginVertical: 8 }}
          initialRegion={{
            latitude: reports.length && reports[0].location ? reports[0].location.lat : 28.6139,
            longitude: reports.length && reports[0].location ? reports[0].location.lng : 77.209,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {reports.map((r) =>
            r.location ? <Marker key={r.id} coordinate={{ latitude: r.location.lat, longitude: r.location.lng }} title={r.type} description={r.description} /> : null
          )}
          {heatCircles.map((c) => (
            <Circle key={c.id} center={{ latitude: c.lat, longitude: c.lng }} radius={c.radius} fillColor={c.color} strokeColor="transparent" />
          ))}
        </MapView>

        <View style={{ height: 220 }}>
          <Text style={{ marginTop: 8, fontWeight: "700" }}>All Reports</Text>
          <FlatList
            data={reports}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.adminRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700" }}>{item.type}</Text>
                  <Text numberOfLines={1} style={{ color: "#444" }}>
                    {item.description}
                  </Text>
                  <Text style={{ color: "#666", fontSize: 12 }}>
                    Status: {item.status} • Upvotes: {item.upvotes}
                  </Text>
                </View>
                <View style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
                  <TouchableOpacity onPress={() => focusOnReport(item)} style={styles.smallBtn}>
                    <Text style={styles.smallBtnText}>Focus</Text>
                  </TouchableOpacity>
                  {item.status !== "Resolved" && (
                    <TouchableOpacity onPress={() => changeStatus(item.id)} style={[styles.smallBtn, { backgroundColor: "#ff9800" }]}>
                      <Text style={styles.smallBtnText}>Next Status</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// -------------------- Main App --------------------
export default function App() {
  const Stack = createNativeStackNavigator();
  const [reports, setReports] = useState([]);

  const addReport = (r) => setReports((prev) => [r, ...prev]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" options={{ title: "Community Reports" }}>
          {(props) => <HomeScreen {...props} reports={reports} setReports={setReports} />}
        </Stack.Screen>
        <Stack.Screen name="Report" options={{ title: "Report Issue" }}>
          {(props) => <ReportScreen {...props} addReport={addReport} />}
        </Stack.Screen>
        <Stack.Screen name="Detail" options={{ title: "Report Detail" }}>
          {(props) => <DetailScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name="AdminLogin" component={AdminLogin} options={{ title: "Admin Login" }} />
        <Stack.Screen name="AdminDashboard" options={{ title: "Admin Dashboard" }}>
          {(props) => <AdminDashboard {...props} reports={reports} setReports={setReports} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f2f2f2" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  reportButton: { backgroundColor: "#007bff", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  reportButtonText: { color: "#fff", fontWeight: "bold" },
  iconButton: { backgroundColor: "#333", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 6, marginRight: 8 },
  iconButtonText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
  card: { flexDirection: "row", backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 12, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  thumb: { width: 80, height: 80, borderRadius: 10, marginRight: 12 },
  desc: { fontWeight: "600", marginBottom: 4, color: "#333" },
  meta: { color: "#555", fontSize: 12 },
  label: { fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8, marginBottom: 10, backgroundColor: "#fff" },
  typeButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: "#ccc", marginRight: 8 },
  typeButtonActive: { backgroundColor: "#007bff", borderColor: "#007bff" },
  typeText: { color: "#333" },
  statusButton: { backgroundColor: "#ff9800", paddingVertical: 10, borderRadius: 20, alignItems: "center", marginTop: 12 },
  statusButtonText: { color: "#fff", fontWeight: "bold" },
  adminRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#fff", borderRadius: 8, marginTop: 8, alignItems: "center", justifyContent: "space-between" },
  smallBtn: { backgroundColor: "#007bff", paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, marginBottom: 6 },
  smallBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
