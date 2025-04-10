// ** Dependencies
import 'react-native-gesture-handler';
import React, { Component, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Linking,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TextInput, PaperProvider } from 'react-native-paper';
import * as NavigationBar from 'expo-navigation-bar';
import { FontAwesome6 as Fa } from '@expo/vector-icons';
import axios from 'axios';

// ** Constants
import COLORS from './constants/colors';
import URLS from './constants/urls';

// ** Utils
function transformHEXToRGBA(hex, opacity) {
  
  // Verifica que el formato hexadecimal sea válido
  const validHex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
  
  if ( ! validHex.test(hex) ) {
    throw new Error("Invalid hex format.");
  }

  // Remueve el símbolo '#' si está presente
  hex = hex.replace(/^#/, '');

  // Si el formato es de 3 caracteres, expande a 6 caracteres
  if ( hex.length === 3 ) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Extrae los valores RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Devuelve el string en formato RGB
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const ViloAuthenticationContext = React.createContext({});
const Stack = createStackNavigator();

function ViloAuthProvider({ children }) {
  return (
    <ViloAuthenticationContext.Provider value={{ isLoggedIn: false, user: null }}>
      { children }
    </ViloAuthenticationContext.Provider>
  );
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 2000);
  }

  render() {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <ViloAuthProvider>
            <ViloTestApp/>
          </ViloAuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vilologo: {
    width: 150,
    height: 150
  },
  jonlemlogo: {
    width: 90,
    height: 27,
    objectFit: 'contain'
  },
  paragraph: {
    color: 'white',
    fontFamily: 'Sans-Serif',
    marginTop: 2,
    marginBottom: 20
  },
  code: {
    fontFamily: 'monospace',
    color: COLORS.VILO_BRAND_COLOR,
    fontSize: 10,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    textAlign: 'center',
    marginTop: 5
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    width: '100%',
    maxWidth: 500
  },
  textField: {
    color: 'white',
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'white',
    justifyContent: 'center',
    borderRadius: 50,
    marginTop: 10,
    width: '100%',
    height: 50,
    maxWidth: 500
  },
  textInput: {
    backgroundColor: transformHEXToRGBA(COLORS.VILO_BRAND_COLOR, 0.75),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
    width: '100%'
  }
});

function ViloTestApp() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={ViloLoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen
          name="Home"
          component={ViloHomeScreen}
          options={{
            headerStyle: {
              backgroundColor: COLORS.VILO_BRAND_COLOR,
              borderBottomWidth: 2,
              borderBottomColor: 'white',
            },
            headerLeft: null,
            headerTitleAlign: 'center',
            headerTitle: 'Todos',
            headerTitleStyle: {
              color: 'white'
            },
            headerRight: () => {

              const navigation = useNavigation();

              return (
                <View style={{ marginRight: 20 }}>
                  <Pressable style={{ display: 'flex', flexDirection: 'row', gap: 15 }} onPress={() => navigation.navigate('Login')}>
                    <Text style={{ color: 'white' }}>Sincere</Text>
                    <Fa name='right-from-bracket' color="white" size={20}/>
                  </Pressable>
                </View>
              );
            }
          }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function ViloLoginScreen({ navigation }) {

  NavigationBar.setBackgroundColorAsync(COLORS.VILO_BRAND_COLOR);

  const [ isSubmitting, setSubmitting ] = useState(false);
  const [ loginFeedback, setLoginFeedback ] = useState(null);
  const [ showPassword, setShowPassword ] = useState(true);

  const [ credentials, setCredentials ] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if ( loginFeedback?.success ) {
      setTimeout(() => {
        navigation.navigate('Home');
      }, 1000);
    }
  }, [ loginFeedback ]);

  const handleCredentialsChangeText = ( field ) => useCallback( ( text ) =>  {
    setCredentials({
      ...credentials,
      [field]: text
    });
  }, [ credentials['email'], credentials['password'] ]);

  const handleSubmit = () => {
    let feedback = null;
    setSubmitting(true);
    setLoginFeedback(null);

    if ( credentials['email'] === 'sincere@april.biz' ) {
      if ( credentials['password'] === '123456' ) {
        feedback = {
          success: true,
          message: 'Login was success',
        };
      } else {
        feedback = {
          success: false,
          message: 'Incorrect username or password',
        };
      } 
    } else {
      feedback = {
        success: false,
        message: 'Incorrect username or password',
      };
    }
  
    setTimeout(() => {
      setSubmitting(false);
      setLoginFeedback(feedback);
    }, 2000);
  };

  const handleOpenLink = ( url ) => useCallback(async () => {
    if ( await Linking.canOpenURL(url) ) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Error opening URL',
        'An error has ocurred opening the URL',
        [ { text: 'dismiss', cancelable: true, style: 'cancel' } ]
      );
    }
  }, [ url ]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={COLORS.VILO_BRAND_COLOR}/>
      <ImageBackground source={require('./assets/img/login-bg.jpg')} resizeMode="cover" style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
        <View style={{ position: 'absolute', bottom: 30, alignItems: 'center' }}>
          <Pressable onPress={handleOpenLink(URLS.VILO_APP_JONLEM_WEBSITE)} >
            <Text style={{ color: 'white', textAlign: 'center', marginBottom: 10, fontSize: 10 }}>
              By
            </Text>
            <Image
              source={require('./assets/img/logo/jonlem-logo-white-300x81.png')}
              style={styles.jonlemlogo}
              alt="JonLem Logo"
            />
          </Pressable>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20, zIndex: 30   }}>
            <Pressable onPress={handleOpenLink(URLS.VILO_APP_JONLEM_FACEBOOK)}>
              <Fa name="facebook" color="white" size={17}/>
            </Pressable>
            <Pressable onPress={handleOpenLink(URLS.VILO_APP_JONLEM_INSTAGRAM)}>
              <Fa name="instagram" color="white" size={17}/>
            </Pressable>
            <Pressable onPress={handleOpenLink(URLS.VILO_APP_JONLEM_X_TWITTER)}>
              <Fa name="x-twitter" color="white" size={17}/>
            </Pressable>
            <Pressable onPress={handleOpenLink(URLS.VILO_APP_JONLEM_YOUTUBE)}>
              <Fa name="youtube" color="white" size={17}/>
            </Pressable>
            <Pressable onPress={handleOpenLink(URLS.VILO_APP_JONLEM_TIKTOK)}>
              <Fa name="tiktok" color="white" size={17}/>
            </Pressable>
            <Pressable onPress={handleOpenLink(URLS.VILO_APP_JONLEM_LINKEDIN)}>
              <Fa name="linkedin" color="white" size={17}/>
            </Pressable>
            <Pressable onPress={handleOpenLink(URLS.VILO_APP_JONLEM_GITHUB)}>
              <Fa name="github" color="white" size={17}/>
            </Pressable>
          </View>
        </View>

        <View style={{ width: '80%', alignItems: 'center', marginTop: -150 }}>
          <Pressable onPress={handleOpenLink(URLS.VILO_APP_VILO_WEBSITE)}>
            <Image
              source={require('./assets/img/logo/vilo-logo-white-700x700.png')}
              style={styles.vilologo}
              alt="Vilo Logo"
            />
          </Pressable>
          
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.paragraph}>
              Welcome to the Vilo Test App, Please Login!
            </Text>
            <Text style={styles.code}>email: sincere@april.biz</Text>
            <Text style={styles.code}>password: 123456</Text>
          </View>
          
          <View style={styles.textField}>
            <TextInput
              mode="flat"
              autoCapitalize="none"
              textColor="white"
              underlineColor="none"
              activeOutlineColor="none"
              cursorColor="white"
              activeUnderlineColor="transparent"
              disabled={isSubmitting}
              style={[ styles.textInput, { opacity: isSubmitting ? 0.6 : 1 } ]}
              placeholder="email"
              placeholderTextColor={COLORS.VILO_PLACEHOLDER_GRAY_TEXT}
              onChangeText={handleCredentialsChangeText('email')}
              value={credentials['email']}
            />
          </View>
          
          <View style={styles.textField}>
            <TextInput
              mode="flat"
              autoCapitalize="none"
              textColor="white"
              underlineColor="none"
              activeOutlineColor="none"
              cursorColor="white"
              activeUnderlineColor="transparent"
              secureTextEntry={showPassword}
              disabled={isSubmitting}
              style={[ styles.textInput, { opacity: isSubmitting ? 0.6 : 1 } ]}
              placeholder="password"
              placeholderTextColor={COLORS.VILO_PLACEHOLDER_GRAY_TEXT}
              onChangeText={handleCredentialsChangeText('password')}
              value={credentials['password']}
              right={
                <TextInput.Icon
                  style={{ marginTop: 25 }}
                  color="white"
                  icon={showPassword ? "eye" : "eye-off"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
          </View>
          
          {loginFeedback && (
            <Text
              style={[
                styles.paragraph,
                {
                  color: loginFeedback.success
                    ? COLORS.VILO_FEEDBACK_SUCCESS_TEXT
                    : COLORS.VILO_FEEDBACK_ERROR_TEXT
                }
              ]}
            >
              {loginFeedback.message}
            </Text>
          )}
          
          <TouchableOpacity
            disabled={isSubmitting || credentials['email'] === '' || credentials['password'] === '' }
            onPress={handleSubmit}
            style={[
              styles.button,
              {
                opacity:
                  credentials['email'] === '' || credentials['password'] === ''
                  ? 0.6
                  : 1
              }
            ]}
          >
            {isSubmitting
              ? <ActivityIndicator color={COLORS.VILO_BRAND_COLOR}/>
              : <Text style={{ textAlign: 'center', color: COLORS.VILO_BRAND_COLOR }}>Log in</Text>
            }
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </SafeAreaView>
  );
}

function ViloTextInput ({
  placeholder,
  placeholderTextColor,
  secureTextEntry,
  autoCapitalize,
  value,
  onChangeText,
  wLong,
  onFocus,
  inputMode = "text"
}) {
  
  const [ width ] = useState(wLong);
  const [ showPassword, setShowPassword ] = useState(secureTextEntry);

  return (
    <View style={[inputStyles.inputView1, { padding: 0, paddingLeft: 5, width }]}> 
      <TextInput
        mode="flat"
        style={[inputStyles.inputText, { width: "100%", padding: 0 }]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={showPassword}
        autoCapitalize={autoCapitalize}
        value={value}
        inputMode={inputMode}
        onFocus={onFocus}
        onChangeText={onChangeText}
        right={
          <TextInput.Icon
            icon={ showPassword ? "eye" : "eye-off" }
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />
    </View>
  );
};

function TodoItem({ title }) {
  return (
    <View style={{ backgroundColor: 'white', borderTopColor: '#d2d2d2', borderTopWidth: 1 }}>
      <Text style={[ styles.paragraph, { color: 'black' } ]}>
        { title }
      </Text>
    </View>
  );
}

function ViloHomeScreen({ navigation }) {

  const [ todos, setTodos ] = useState([]);
  const [ isFetchingTodos, setIsFetchingTodos ] = useState(true);

  useEffect(() => {
    if ( isFetchingTodos ) fetchTodos();
  }, [ isFetchingTodos ]);

  const fetchTodos = async () => {
    let response;
    
    try {
      response = await axios.get('https://jsonplaceholder.typicode.com/todos');

      if ( response ) {
        setTodos(response.data);
      }
    } catch ( err ) {
      Alert.alert(
        'HTTP Error',
        'There was as an error while fetching TODOs.'
      );
    } finally {
      setIsFetchingTodos(!isFetchingTodos);
    }
  };

  return (
    <SafeAreaView style={[ { backgroundColor: 'white', width: '100%' } ]}>
      {isFetchingTodos && <ActivityIndicator color={COLORS.VILO_BRAND_COLOR}/>}
      {!isFetchingTodos && todos.length === 0 && <Text>There are no TODOs.</Text>}
      {todos.length > 0  && !isFetchingTodos && (
        <FlatList
          data={todos}
          keyExtractor={todo => todo.id}
          renderItem={( todo ) => <TodoItem title={todo.item.title} />}
        />
      )}
    </SafeAreaView>
  );
}

export default App;
