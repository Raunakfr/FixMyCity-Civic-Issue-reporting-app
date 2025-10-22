# FixMyCity-Civic-Issue-reporting-app
## Description<br>
Unreported and unresolved civic issues are a grave issue especially in densely populated countries like india.&lt;br>
To provide a solution to this, as a part of CodeSlayer 2k25 hackathon, my team created an Expo based app named "FixMyCity"<br>
## How to run [For V1] <br>
➡️ Step 1: Download the zip from Github repo.<br>
➡️ Step 2: Open terminal and navigate to the downloaded folder.<br>
➡️ Step 3: Install dependencies:<br>1.npm install @react-navigation/native @react-navigation/native-stack<br>2. npx expo install react-native-screens react-native-safe-area-context<br>3. npx expo install expo-image-picker expo-location<br>
➡️ Step 4: Start the server<br>✨npx expo start<br>
🛑 **Please note that the app is being hosted locally so the host and the client should be on the same network for the app to bundle successfully**
## Features<br>
⭐ Users can snap a photo, add a short description and post the issue within a minute.<br>
⭐ Users can also **comment**, **upvote/downvote** on other users post so that the most alarming issue can surface to the top.<br>
⭐ Our app has a seperate **Admin login panel**, where the authorities can login and check the issues present on a map.<br>
⭐ **Heatmaps** are automatically created on the map where the issue is located, the heatmap markings may grow big or small depending on the number of downvotes or upvotes the problem recieves.<br>
⭐ For a clean, clutter free and easy to work with interface there is an option to **change the current status** of problems, there are three possible states namely, <br>✨1. Reported - In this state the problem has been reported on the apps and authorities are yet to take action on it.<br>✨2. In progress - In this state, the problem has been noticed by the respective authority and action has been taken to resolve it.<br>✨3. Solved - In this state the problem has been solved, also the **heatmaps** of all the problems marked as solved are **removed from the map** to keep the map clean and ready for more issues.<br>
## Current tech stack<br>
⭐ Frontend:<br>  ✨Framework: React native(Expo CLI)<br>  ✨Libraries used:<br>   💫react-navigation<br>   💫expo-image-picker<br>   💫expo-location<br>   💫react-native-maps<br>   💫react-native<br>  ✨UI Design - Pure react native styling, no external UI<br>⭐Backend: Locally hosted
## Future updates(if selected)<br>
If our project gets selected for round 2, there are going to be future updates to the app. Here's what is planned:<br>
⭐ Integration of MongoDB for real time updates and tracking.<br>
⭐ AI powered issue detection: We will train an AI to automatically analyse the image and detect what type of problem it is.<br>
⭐ Predictive analytics dashboard(Adv): In the admin panel there is going to be a seperate section titled "Predictions", where we can show the areas where problems are likely to occur using data analysis.<br>
⭐ Cross-Platform Expansion - Extend support to IOS.<br>
⭐ Automated SMS/Email Updates - Users get automatic notifications when their problems are under action and when they get resolved.
