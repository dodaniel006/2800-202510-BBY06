import { StyleSheet, Text, View, TextInput, Button, Switch } from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  initialize,
  requestPermission,
  readRecords,
  readRecord,
  insertRecords,
  deleteRecordsByUuids
} from 'react-native-health-connect';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {requestNotifications} from 'react-native-permissions';
import * as Sentry from '@sentry/react-native';
import messaging from '@react-native-firebase/messaging';
import {Notifications} from 'react-native-notifications';
import { TouchableOpacity } from 'react-native';
import { BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Platform, ProgressViewIOS } from 'react-native';
import { ProgressBarAndroid } from 'react-native';
import { ScrollView } from 'react-native';
import { Image } from 'react-native';

let isSentryEnabled = true;

// ✅ Sentry.init must run IMMEDIATELY and SYNCHRONOUSLY
Sentry.init({
  dsn: 'https://e4a201b96ea602d28e90b5e4bbe67aa6@sentry.shuchir.dev/6',
});

// 🔄 Now check storage asynchronously to disable it afterward if needed
AsyncStorage.getItem('sentryEnabled')
  .then(res => {
    if (res === "false") {
      Sentry.close();
      isSentryEnabled = false;
      console.log("Sentry disabled via storage");
    } else {
      console.log("Sentry enabled via default or storage");
    }
  })
  .catch(err => {
    console.log("Failed to read sentryEnabled", err);
  });


const setObj = async (key, value) => { try { const jsonValue = JSON.stringify(value); await AsyncStorage.setItem(key, jsonValue) } catch (e) { console.log(e) } }
const setPlain = async (key, value) => { try { await AsyncStorage.setItem(key, value) } catch (e) { console.log(e) } }
const get = async (key) => { try { const value = await AsyncStorage.getItem(key); if (value !== null) { try { return JSON.parse(value) } catch { return value } } } catch (e) { console.log(e) } }
const delkey = async (key, value) => { try { await AsyncStorage.removeItem(key) } catch (e) { console.log(e) } }
const getAll = async () => { try { const keys = await AsyncStorage.getAllKeys(); return keys } catch (error) { console.error(error) } }
const CustomButton = ({ title, onPress, color = 'white', textColor = 'black' }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: color,
      padding: 12,
      borderRadius: 6,
      alignItems: 'center',
      marginVertical: 7,
    }}
  >
    <Text style={{ color: textColor, fontSize: 16 }}>{title}</Text>
  </TouchableOpacity>
);

const CustomButton2 = ({ title, onPress, color = 'black', textColor = 'white' }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: color,
      padding: 12,
      borderRadius: 6,
      alignItems: 'center',
      marginVertical: 7,
    }}
  >
    <Text style={{ color: textColor, fontSize: 16 }}>{title}</Text>
  </TouchableOpacity>
);

Notifications.setNotificationChannel({
  channelId: 'push-errors',
  name: 'Push Errors',
  importance: 5,
  description: 'Alerts for push errors',
  groupId: 'push-errors',
  groupName: 'Errors',
  enableLights: true,
  enableVibration: true,
  showBadge: true,
  vibrationPattern: [200, 1000, 500, 1000, 500],
})


ReactNativeForegroundService.register();

const requestUserPermission = async () => {
  try {
    await messaging().requestPermission();
    const token = await messaging().getToken();
    console.log('Device Token:', token);
    return token;
  } catch (error) {
    console.log('Permission or Token retrieval error:', error);
  }
};

messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (remoteMessage.data.op == "PUSH") handlePush(remoteMessage.data);
  if (remoteMessage.data.op == "DEL") handleDel(remoteMessage.data);
});

messaging().onMessage(remoteMessage => {
  if (remoteMessage.data.op == "PUSH") handlePush(remoteMessage.data);
  if (remoteMessage.data.op == "DEL") handleDel(remoteMessage.data);
});

let login;
let apiBase = 'https://healthapi.yehorskudilov.com';
let lastSync = null;
let taskDelay = 7200 * 1000; // 2 hours
let fullSyncMode = true; // Default to full 30-day sync

// Toast.show({
//   type: 'info',
//   text1: "Loading API Base URL...",
//   autoHide: false
// })
// get('apiBase')
// .then(res => {
//   if (res) {
//     apiBase = res;
//     Toast.hide();
//     Toast.show({
//       type: "success",
//       text1: "API Base URL loaded",
//     })
//   }
//   else {
//     Toast.hide();
//     Toast.show({
//       type: "error",
//       text1: "API Base URL not found. Using default server.",
//     })
//   }
// })

get('login')
.then(res => {
  if (res) {
    login = res;
  }
})

get('lastSync')
.then(res => {
  if (res) {
    lastSync = res;
  }
})

get('fullSyncMode')
.then(res => {
  if (res !== null) {
    fullSyncMode = res === 'true';
  }
})

const askForPermissions = async () => {
  const isInitialized = await initialize();

  const grantedPermissions = await requestPermission([
    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    { accessType: 'read', recordType: 'BasalBodyTemperature' },
    { accessType: 'read', recordType: 'BloodGlucose' },
    { accessType: 'read', recordType: 'BloodPressure' },
    { accessType: 'read', recordType: 'BasalMetabolicRate' },
    { accessType: 'read', recordType: 'BodyFat' },
    { accessType: 'read', recordType: 'BodyTemperature' },
    { accessType: 'read', recordType: 'BoneMass' },
    { accessType: 'read', recordType: 'CyclingPedalingCadence' },
    { accessType: 'read', recordType: 'CervicalMucus' },
    { accessType: 'read', recordType: 'ExerciseSession' },
    { accessType: 'read', recordType: 'Distance' },
    { accessType: 'read', recordType: 'ElevationGained' },
    { accessType: 'read', recordType: 'FloorsClimbed' },
    { accessType: 'read', recordType: 'HeartRate' },
    { accessType: 'read', recordType: 'Height' },
    { accessType: 'read', recordType: 'Hydration' },
    { accessType: 'read', recordType: 'LeanBodyMass' },
    { accessType: 'read', recordType: 'MenstruationFlow' },
    { accessType: 'read', recordType: 'MenstruationPeriod' },
    { accessType: 'read', recordType: 'Nutrition' },
    { accessType: 'read', recordType: 'OvulationTest' },
    { accessType: 'read', recordType: 'OxygenSaturation' },
    { accessType: 'read', recordType: 'Power' },
    { accessType: 'read', recordType: 'RespiratoryRate' },
    { accessType: 'read', recordType: 'RestingHeartRate' },
    { accessType: 'read', recordType: 'SleepSession' },
    { accessType: 'read', recordType: 'Speed' },
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'StepsCadence' },
    { accessType: 'read', recordType: 'TotalCaloriesBurned' },
    { accessType: 'read', recordType: 'Vo2Max' },
    { accessType: 'read', recordType: 'Weight' },
    { accessType: 'read', recordType: 'WheelchairPushes' },
    { accessType: 'write', recordType: 'ActiveCaloriesBurned' },
    { accessType: 'write', recordType: 'BasalBodyTemperature' },
    { accessType: 'write', recordType: 'BloodGlucose' },
    { accessType: 'write', recordType: 'BloodPressure' },
    { accessType: 'write', recordType: 'BasalMetabolicRate' },
    { accessType: 'write', recordType: 'BodyFat' },
    { accessType: 'write', recordType: 'BodyTemperature' },
    { accessType: 'write', recordType: 'BoneMass' },
    { accessType: 'write', recordType: 'CyclingPedalingCadence' },
    { accessType: 'write', recordType: 'CervicalMucus' },
    { accessType: 'write', recordType: 'ExerciseSession' },
    { accessType: 'write', recordType: 'Distance' },
    { accessType: 'write', recordType: 'ElevationGained' },
    { accessType: 'write', recordType: 'FloorsClimbed' },
    { accessType: 'write', recordType: 'HeartRate' },
    { accessType: 'write', recordType: 'Height' },
    { accessType: 'write', recordType: 'Hydration' },
    { accessType: 'write', recordType: 'LeanBodyMass' },
    { accessType: 'write', recordType: 'MenstruationFlow' },
    { accessType: 'write', recordType: 'MenstruationPeriod' },
    { accessType: 'write', recordType: 'Nutrition' },
    { accessType: 'write', recordType: 'OvulationTest' },
    { accessType: 'write', recordType: 'OxygenSaturation' },
    { accessType: 'write', recordType: 'Power' },
    { accessType: 'write', recordType: 'RespiratoryRate' },
    { accessType: 'write', recordType: 'RestingHeartRate' },
    { accessType: 'write', recordType: 'SleepSession' },
    { accessType: 'write', recordType: 'Speed' },
    { accessType: 'write', recordType: 'Steps' },
    { accessType: 'write', recordType: 'StepsCadence' },
    { accessType: 'write', recordType: 'TotalCaloriesBurned' },
    { accessType: 'write', recordType: 'Vo2Max' },
    { accessType: 'write', recordType: 'Weight' },
    { accessType: 'write', recordType: 'WheelchairPushes' },
  ]);

  console.log(grantedPermissions);

  if (grantedPermissions.length < 68) {
    Toast.show({
      type: 'error',
      text1: "Permissions not granted",
      text2: "Please visit settings to grant all permissions."
    })
  }
};

const refreshTokenFunc = async () => {
  let refreshToken = await get('refreshToken');
  if (!refreshToken) return;
  try {
    let response = await axios.post(`${apiBase}/api/v2/refresh`, {
      refresh: refreshToken
    });
    if ('token' in response.data) {
      console.log(response.data);
      await setPlain('login', response.data.token)
      login = response.data.token;
      await setPlain('refreshToken', response.data.refresh);
      Toast.show({
        type: 'success',
        text1: "Token refreshed successfully",
      })
    }
    else {
      Toast.show({
        type: 'error',
        text1: "Token refresh failed",
        text2: response.data.error
      })
      login = null;
      delkey('login');
    }
  }

  catch (err) {
    Toast.show({
      type: 'error',
      text1: "Token refresh failed",
      text2: err.message
    })
    login = null;
    delkey('login');
  }
}

const sync = async (setSyncSummaryCallback, setSyncingCallback, setProgressCallback) => {

setSyncingCallback(true);
setProgressCallback({ current: 0, total: 0 });

  const isInitialized = await initialize();
  console.log("🔄 Syncing data...");

  let numRecords = 0;
  let numRecordsSynced = 0;
  let syncedSummary = {}; // ✅ collect results

  Toast.show({ type: 'info', text1: "Syncing data..." });

  const currentTime = new Date().toISOString();
  const startTime = fullSyncMode
    ? new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
    : lastSync || new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString();

  await setPlain('lastSync', currentTime);
  lastSync = currentTime;

  let pendingSyncs = [];

  const recordTypes = [
    "ActiveCaloriesBurned", "BasalBodyTemperature", "BloodGlucose", "BloodPressure", "BasalMetabolicRate", "BodyFat",
    "BodyTemperature", "BoneMass", "CyclingPedalingCadence", "CervicalMucus", "ExerciseSession", "Distance", "ElevationGained",
    "FloorsClimbed", "HeartRate", "Height", "Hydration", "LeanBodyMass", "MenstruationFlow", "MenstruationPeriod",
    "Nutrition", "OvulationTest", "OxygenSaturation", "Power", "RespiratoryRate", "RestingHeartRate", "SleepSession", "Speed",
    "Steps", "StepsCadence", "TotalCaloriesBurned", "Vo2Max", "Weight", "WheelchairPushes"
  ];

  for (let type of recordTypes) {
    const token = await get('login');
    if (!token) {
      return resolve();
    }
    let records = [];
    try {
      const result = await readRecords(type, {
        timeRangeFilter: { operator: "between", startTime, endTime: currentTime }
      });
      records = result.records;
    } catch (err) {
      console.log(`❌ Error reading ${type}:`, err);
      continue;
    }

    numRecords += records.length;
setProgressCallback(prev => ({ ...prev, total: numRecords }));

    if (records.length === 0) continue;

    if (["SleepSession", "Speed", "HeartRate"].includes(type)) {
      for (let j = 0; j < records.length; j++) {
        const delay = j * 3000;
        const promise = new Promise(resolve => {
          setTimeout(async () => {
            try {
              if (!token) {
                return resolve();
              }

              const record = await readRecord(type, records[j].metadata.id);
              await axios.post(`${apiBase}/api/v2/sync/${type}`, { data: record }, {
                headers: { "Authorization": `Bearer ${login}` }
              });
              syncedSummary[type] = (syncedSummary[type] || 0) + 1;
            } catch (err) {
              console.log(`❌ Error syncing ${type} record`, err);
            }

            numRecordsSynced += 1;
            setProgressCallback(prev => ({ ...prev, current: prev.current + 1 }));

            ReactNativeForegroundService.update({
              id: 1244,
              title: 'Japples Sync Progress',
              message: `Syncing... [${numRecordsSynced}/${numRecords}]`,
              icon: 'ic_launcher',
              progress: { max: numRecords, curr: numRecordsSynced },
            });

            resolve();
          }, delay);
        });

        pendingSyncs.push(promise);
      }
    } else {
      try {
        await axios.post(`${apiBase}/api/v2/sync/${type}`, { data: records }, {
          headers: { "Authorization": `Bearer ${login}` }
        });
        syncedSummary[type] = records.length;
        numRecordsSynced += records.length;
        setProgressCallback(prev => ({ ...prev, current: prev.current + records.length }));

        ReactNativeForegroundService.update({
          id: 1244,
          title: 'Japples Sync Progress',
          message: `Syncing... [${numRecordsSynced}/${numRecords}]`,
          icon: 'ic_launcher',
          progress: { max: numRecords, curr: numRecordsSynced },
        });
      } catch (err) {
        console.log(`❌ Error syncing ${type}:`, err);
      }
    }
  }

  // Wait for all delayed syncs to complete
  await Promise.all(pendingSyncs);
setSyncingCallback(false);


  // ✅ Print sync summary
  console.log("✅ Sync Summary:");
  if (Object.keys(syncedSummary).length === 0) {
    console.log("No records were synced.");
  } else {
    for (const [type, count] of Object.entries(syncedSummary)) {
      console.log(`${type}: ${count} record(s)`);
    }
  }

  setSyncSummaryCallback(Object.entries(syncedSummary));

ReactNativeForegroundService.update({
  id: 1244,
  title: 'Japples Sync Service',
  message: '✅ Sync finished',
  icon: 'ic_launcher',
});


  Toast.show({
    type: 'success',
    text1: "Sync completed!",
    text2: `Synced ${numRecordsSynced} records.`,
  });
};


const handlePush = async (message) => {
  const isInitialized = await initialize();
  
  let data = JSON.parse(message.data);
  console.log(data);

  insertRecords(data)
  .then((ids) => {
    console.log("Records inserted successfully: ", { ids });
  })
  .catch((error) => {
    Notifications.postLocalNotification({
      body: "Error: " + error.message,
      title: `Push failed for ${data[0].recordType}`,
      silent: false,
      category: "Push Errors",
      fireDate: new Date(),
      android_channel_id: 'push-errors',
    });
  })
}

const handleDel = async (message) => {
  const isInitialized = await initialize();
  
  let data = JSON.parse(message.data);
  console.log(data);

  deleteRecordsByUuids(data.recordType, data.uuids, data.uuids)
  axios.delete(`${apiBase}/api/v2/sync/${data.recordType}`, {
    data: {
      uuid: data.uuids,
    },
    headers: {
      "Authorization": `Bearer ${login}`
    }
  })
}
  

export default Sentry.wrap(function App() {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [form, setForm] = React.useState(null);
  const [showSyncWarning, setShowSyncWarning] = React.useState(false);
  const [showWeb, setShowWeb] = React.useState(false);
const [syncSummary, setSyncSummary] = React.useState([]);
const [showSyncSummary, setShowSyncSummary] = React.useState(false);
const [syncProgress, setSyncProgress] = React.useState({ current: 0, total: 0 });
const [syncing, setSyncing] = React.useState(false);
const [username, setUsername] = React.useState('');

React.useEffect(() => {
  const loadUsername = async () => {
    const storedUsername = await get('userName');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  };

  loadUsername();
}, []);

  const loginFunc = async () => {
    Toast.show({
      type: 'info',
      text1: "Logging in...",
      autoHide: false
    })

     try {
    const res = await fetch('https://japples.yehorskudilov.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.username,
        password: form.password,
        isHealthAppLinked: true,
      }),
    });

    const data = await res.json();


    let userId = data.userId;
    let userName = data.username;

    await setPlain('userId', userId); 
    await setPlain('userName', userName); 
    setUsername(userName);

    console.log("ahssawsas " + JSON.stringify(data));

    let fcmToken = await requestUserPermission();
    form.fcmToken = fcmToken;
    let response = await fetch(`${apiBase}/api/v2/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: userId,      // use userId as username
      password: userId,      // use userId as password
      fcmToken: fcmToken     // optional if needed
    }),
  });
    const responseData = await response.json();

  if (response.ok && 'token' in responseData) {
    console.log(responseData);
    await setPlain('login', responseData.token);
    login = responseData.token;
    await setPlain('refreshToken', responseData.refresh);
    forceUpdate();
    Toast.hide();
    Toast.show({
      type: 'success',
      text1: "Logged in successfully",
    });
    askForPermissions();
  } else {
    Toast.hide();
    Toast.show({
      type: 'error',
      text1: "Login failed",
      text2: responseData.error || "Unknown error"
    });
  }}


    catch (err) {
      Toast.hide();
      Toast.show({
        type: 'error',
        text1: "Login failed",
        text2: err.message
      })
    }
  }

  React.useEffect(() => {
    requestNotifications(['alert']).then(({status, settings}) => {
      console.log(status, settings)
    });

    get('login')
    .then(res => {
      if (res) {
        login = res;
        get('taskDelay')
        .then(res => {
          if (res) taskDelay = Number(res);
        })

        ReactNativeForegroundService.add_task(() => sync(), {
          delay: taskDelay,
          onLoop: true,
          taskId: 'Japples_sync',
          onError: e => console.log(`Error logging:`, e),
        });

        ReactNativeForegroundService.add_task(() => refreshTokenFunc(), {
          delay: 10800 * 1000,
          onLoop: true,
          taskId: 'refresh_token',
          onError: e => console.log(`Error logging:`, e),
        });

        ReactNativeForegroundService.start({
          id: 1244,
          title: 'Japples Sync Service',
          message: 'Japples is working in the background to sync your data.',
          icon: 'ic_launcher',
          setOnlyAlertOnce: true,
          color: '#000000',
        }).then(() => console.log('Foreground service started'));

        forceUpdate()
      }
    })
  }, [login])

React.useEffect(() => {
  const onBackPress = () => {
    if (showWeb) {
      setShowWeb(false);
      return true; // prevent default exit behavior
    }
    return false;
  };

  const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  return () => sub.remove();
}, [showWeb]);

return showWeb ? (
  <WebView
    source={{ uri: 'https://japples.yehorskudilov.com' }}
    style={{ flex: 1 }}
  />
) : (
  <ScrollView contentContainerStyle={styles.container}>      
  {login &&
        <View>
<Image
  source={require('./assets/icon.png')}
  style={{ width: 100, height: 100, marginBottom: 20, marginHorizontal: 'auto' }}
  resizeMode="contain"
/>


          <Text style={{ fontSize: 20,textAlign: 'center' , marginBottom: 40, color: 'white' }}>
            You are currently logged in as {username  || "unknown user"}
          </Text>

            <Text style={{ fontSize: 17, marginVertical: 10,marginBottom: 40, marginHorizontal:'auto', color: 'white' }}>
          Last Sync: {lastSync ? new Date(lastSync).toLocaleString() : 'N/A'}
        </Text>

      
          {/* <Text style={{ marginTop: 10, fontSize: 15 }}>API Base URL:</Text>
          <TextInput
            style={styles.input}
            placeholder="API Base URL"
            defaultValue={apiBase}
            onChangeText={text => {
              apiBase = text;
              setPlain('apiBase', text);
            }}
          /> */}

         <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal:'auto' }}>
  <Text style={{ fontSize: 15, color: 'white', textAlign: "center", marginRight: 10 }}>
    Sync Interval:
  </Text>

<View style={{
  borderWidth: 1,
  borderColor: '#ccc',
  backgroundColor: 'white',
  borderRadius: 4,
  height: 40,
  width: 130,
  justifyContent: 'center',
  overflow: 'hidden',
}}>
  <Picker
    selectedValue={taskDelay}
    onValueChange={(value) => {
      taskDelay = value;
      setPlain('taskDelay', String(value));
      ReactNativeForegroundService.update_task(() => sync(), {
        delay: taskDelay,
      });
      Toast.show({
        type: 'success',
        text1: 'Sync interval updated',
      });
    }}
    style={{
      height: 40,
      marginTop: 0, // ✅ nudge text upward slightly for vertical centering
    }}
    dropdownIconColor="#000"
    mode="dropdown"
  >
    <Picker.Item label="5 min" value={5 * 60 * 1000} />
    <Picker.Item label="15 min" value={15 * 60 * 1000} />
    <Picker.Item label="30 min" value={30 * 60 * 1000} />
    <Picker.Item label="1 hr" value={60 * 60 * 1000} />
    <Picker.Item label="2 hr" value={2 * 60 * 60 * 1000} />
    <Picker.Item label="4 hr" value={4 * 60 * 60 * 1000} />
  </Picker>
</View>


</View>


            {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ fontSize: 15 }}>Enable Sentry:</Text>
            <Switch
              value={isSentryEnabled}
              onValueChange={async (value) => {
              if (value) {
                Sentry.init({
                dsn: 'https://0e831d625e3149f83c56fc44d13003b7@o4508755575701504.ingest.de.sentry.io/4509136718004304',
                tracesSampleRate: 1.0,
                });
                Toast.show({
                type: 'success',
                text1: "Sentry enabled",
                });
                isSentryEnabled = true;
                forceUpdate();
              } else {
                Sentry.close();
                Toast.show({
                type: 'success',
                text1: "Sentry disabled",
                });
                isSentryEnabled = false;
                forceUpdate();
              }
              await setPlain('sentryEnabled', value.toString());
              }}
            />
            </View> */}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal:'auto', marginVertical: 10 }}>
            <Text style={{ fontSize: 15, color: 'white'  }}>Full 30-day sync:</Text>
            <Switch
              value={fullSyncMode}
              onValueChange={async (value) => {
                if (!value) {
                  setShowSyncWarning(true);
                } else {
                  fullSyncMode = value;
                  await setPlain('fullSyncMode', value.toString());
                  Toast.show({
                    type: 'info',
                    text1: "Sync mode updated",
                    text2: "Will sync full 30 days of data"
                  });
                  forceUpdate();
                }
              }}
            />
          </View>
          


          {showSyncWarning && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                Warning: Incremental sync only syncs data since the last sync. 
                You may miss data if the app stops abruptly.
              </Text>
              <View style={styles.warningButtons}>
                <CustomButton2
                  title="Cancel"
                  onPress={() => {
                    setShowSyncWarning(false);
                  }}
                />
                <CustomButton2
                  title="Continue"
                  onPress={async () => {
                    fullSyncMode = false;
                    await setPlain('fullSyncMode', 'false');
                    setShowSyncWarning(false);
                    Toast.show({
                      type: 'info',
                      text1: "Sync mode updated",
                      text2: "Will only sync data since last sync"
                    });
                    forceUpdate();
                  }}
                />
              </View>
            </View>
          )}

          {syncing && (
  <View style={{ marginVertical: 20, width: '100%', alignItems: 'center', marginHorizontal: 'auto' }}>
    <Text style={{ color: 'white', marginBottom: 10 }}>
      Syncing... {syncProgress.current} / {syncProgress.total}
    </Text>
    {Platform.OS === 'android' ? (
      <ProgressBarAndroid
        styleAttr="Horizontal"
        indeterminate={false}
        progress={
          syncProgress.total
            ? syncProgress.current / syncProgress.total
            : 0
        }
        color="#ffffff"
        style={{ width: 300, }}
      />
    ) : (
      <ProgressViewIOS
        progress={
          syncProgress.total
            ? syncProgress.current / syncProgress.total
            : 0
        }
        style={{ width: 300 }}
      />
    )}
  </View>
)}



          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 8,
            paddingHorizontal: 10,
            marginVertical: 2,
            borderRadius: 6,
            backgroundColor: '#3a7762'
          }}>
    
    <View style={{ marginTop: 5, width: '100%' }}>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Sync Summary</Text>
    <TouchableOpacity onPress={() => setShowSyncSummary(prev => !prev)}>
      <Text style={{ fontSize: 16, color: '#ccc' }}>
        {showSyncSummary ? 'Hide ▲' : 'Show ▼'}
      </Text>
    </TouchableOpacity>
  </View>

  {showSyncSummary && (
    syncSummary.length > 0 ? (
      <FlatList
        data={syncSummary}
        keyExtractor={([type]) => type}
        renderItem={({ item: [type, count] }) => (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderColor: '#ccc',
          }}>
            <Text style={{ color: 'white', fontSize: 16 }}>{type}</Text>
            <Text style={{ color: 'white', fontSize: 16 }}>{count} record(s)</Text>
          </View>
        )}
      />
    ) : (
      <Text style={{ color: '#ccc', fontStyle: 'italic' }}>No records synced yet.</Text>
    )
  )}
</View>



          </View>

          

          <View style={{ marginTop: 5 }}>
           <CustomButton
  title="Sync Now"
  onPress={async () => {
    await sync(setSyncSummary, setSyncing, setSyncProgress);
    Toast.show({
      type: 'success',
      text1: "Sync completed",
    });
    
    const userId = await get('userId');


    const response = await fetch('https://japples.yehorskudilov.com/api/db/syncAll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        queries: {}
      })
    });
  }}
/>

          </View>

          <View>
            <CustomButton title="Open Japples" onPress={() => setShowWeb(true)} />

          </View>

          <View style={{ marginTop: 0 }}>
            <CustomButton
              title="Logout"
              onPress={async () => {
              const userId = await get('userId');

              fetch('https://japples.yehorskudilov.com/api/auth/logout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    userId,
                    isHealthAppLinked: false
                  })
                })
                  .then(res => res.json())
                  .then(data => {
                    console.log('Logout successful:', data);
                  })
                  .catch(err => {
                    console.error('Logout failed:', err);
                  });

                await delkey('login');
                await delkey('refreshToken');
                await delkey('userId');
                await delkey('userName');
                login = null;
                Toast.show({
                  type: 'success',
                  text1: "Logged out successfully",
                })
                forceUpdate();
              }}
            />
          </View>
        </View>
      }
      {!login &&
              <View style={{marginBottom: 100}}>

              <Image
                source={require('./assets/icon.png')}
                style={{ width: 100, height: 100, marginHorizontal: 'auto' }}
                resizeMode="contain"
              />

                 <Text style={{ 
                   fontSize: 30,
                   color: 'white',
                   fontWeight: 'bold',
                   textAlign: 'center',
                  }}>Login</Text>
       
                  <Text style={{ marginVertical: 10, marginHorizontal:'auto', color: 'white' }}>Log in with you Japples credentials</Text>
       
                 <TextInput
                   style={styles.input}
                   placeholder="Username"
                   onChangeText={text => setForm({ ...form, username: text })}
                 />
                 <TextInput
                   style={styles.input}
                   placeholder="Password"
                   secureTextEntry={true}
                   onChangeText={text => setForm({ ...form, password: text })}
                 />
                
       
               
       
               <CustomButton
                 title="Login"
                 onPress={loginFunc}
               />
       
               </View>
      }

    <StatusBar style="dark" />
    <Toast />
    </ScrollView>
  );
});;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d6242',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    marginVertical: 7,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    width: 350,
    fontSize: 17,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    color: '#000' // keep this black if input text should stay dark
  },
  button: {
    color: 'red',
  },
  warningContainer: {
    backgroundColor: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  warningText: {
    color: 'black', // changed to white
    marginBottom: 10,
  },
  warningButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  text: {
    color: '#ffffff' // universal text style
  }
});