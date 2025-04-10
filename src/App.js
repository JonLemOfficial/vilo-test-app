// ** Dependencies
import 'react-native-gesture-handler';
import React, { Component, useState, useEffect, useCallback, useContext, useLayoutEffect } from 'react';
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
  StatusBar,
  ImageBackground
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TextInput, PaperProvider, Searchbar, TouchableRipple, RadioButton } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from 'expo-navigation-bar';
import { FontAwesome6 as Fa, FontAwesome5 as Fa5 } from '@expo/vector-icons';
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

const DEFAULT_VILO_AUTH_STATE_VALUES = {
  token: null,
  isLoggedIn: false,
  user: {
    id: null,
    username: null,
    email: null,
  }
};

const ViloAuthenticationContext = React.createContext(DEFAULT_VILO_AUTH_STATE_VALUES);
const Stack = createStackNavigator();

function ViloAuthProvider({ children }) {

  const [ authData, setAuthData ] = useState(DEFAULT_VILO_AUTH_STATE_VALUES);

  useEffect(() => {
  
    // Get the token from async storage
    AsyncStorage.getItem("authData").then(authData => {
      if ( authData ) {
        setAuthData(JSON.parse(authData));
      }
    });

  }, [  ]);

  const logIn = async ( credentials, callback ) => {
  
    try {
      if ( credentials['email'] === 'sincere@april.biz' && credentials['password'] === '123456' ) {
        const successAuthData = {
          token: 'abcdef',
          isLoggedIn: true,
          user: {
            id: 1,
            username: 'sincere',
            email: 'sincere@april.biz'
          }
        };

        callback(successAuthData, false);
        await AsyncStorage.setItem("authData", JSON.stringify(successAuthData));
        setAuthData(successAuthData);
      } else {
        callback(null, true);
      }

      // const response = await axios.post("https://eden.slasdevelopments.com/api/auth/login", {
      //   email,
      //   password,
      // });

      // if ( response ) {
      //   if ( __DEV__ ) console.log("Respuesta de API", response.data);
      //   const { token, data } = response.data;
      //   await AsyncStorage.setItem(
      //     "authData",
      //     JSON.stringify({ token, isAuthenticated: true, data })
      //   );

      //   setAuthData({ token, isAuthenticated: true, data });
      // }
    } catch (error) {
        if ( __DEV__ ) console.log(`Login error ${error}`);
        
        Alert.alert(
          "Authentication Error",
          `Ha ocurrido un error inesperado. \n\nINF: ${error.message}`, 
          [
            {
              text: "Ok",
              onPress: () => void 0
            }
          ]
        );
    }
  };

  const logOut = () => {
    AsyncStorage.removeItem("authData");
    setAuthData(DEFAULT_VILO_AUTH_STATE_VALUES);
    // const { token } = authData;
    
    // axios
    //   .get("https://eden.slasdevelopments.com/api/auth/logout", {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   })
    //   .then((response) => {
    //     if (response.status === 200) {
    //       // La solicitud de cierre de sesión se realizó con éxito
    //       AsyncStorage.removeItem("authData");
    //       setAuthData(DEFAULT_AUTH_STATE_VALUES);
    //     } else {
    //       // La solicitud de cierre de sesión falló
    //       if ( __DEV__ ) {
    //         console.log(response.status);
    //         console.log(response.data);
    //       }
    //     }
    //   })
    //   .catch((error) => {
    //     if ( __DEV__ ) console.log(`isLoading in error ${error}`);
    //     setAuthData(DEFAULT_AUTH_STATE_VALUES);
    //   });
  };

  return (
    <ViloAuthenticationContext.Provider value={{ authData, logIn, logOut }}>
      { children }
    </ViloAuthenticationContext.Provider>
  );
}

// ** Hooks

const useViloAuth = () => {

  const { authData, logIn, logOut } = useContext(ViloAuthenticationContext);

  return {
    isLoggedIn: authData.isLoggedIn,
    token: authData.token,
    user: authData.user,
    logIn,
    logOut,
  };

};

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
  },
  searchBar: {
    width: "100%",
    backgroundColor: '#def0ff',
    // color: PALETTE_COLORS.BLUEGEM,
    // borderRadius: 50,
    // borderStyle: "solid",
    // borderColor: PALETTE_COLORS.BLUEGEM,
  },
  consultorioInfoImage: {
    backgroundColor: "#dfdfdf",
    width: "15%",
    height: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  consultorioInfoText: {
    width: "85%",
    alignItems: "flex-start",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  highlight: {
    backgroundColor: 'yellow'
  }
});

function ViloTestApp() {

  const { isLoggedIn } = useViloAuth();

  if ( __DEV__ ) {
    useEffect(() => {
      console.log(isLoggedIn);
    }, [ isLoggedIn ]);
  }

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
              
              const { logOut } = useViloAuth();
              const navigation = useNavigation();

              const handleLogOutPress = () => {
                logOut();
                navigation.navigate('Login');
              };

              return (
                <View style={{ marginRight: 20 }}>
                  <Pressable style={{ display: 'flex', flexDirection: 'row', gap: 15 }} onPress={handleLogOutPress}>
                    <Text style={{ color: 'white' }}>Sincere</Text>
                    <Fa name='right-from-bracket' color="white" size={20}/>
                  </Pressable>
                </View>
              );
            }
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function ViloLoginScreen({ navigation }) {

  NavigationBar.setBackgroundColorAsync(COLORS.VILO_BRAND_COLOR);

  const { logIn, isLoggedIn } = useViloAuth();

  const [ isSubmitting, setSubmitting ] = useState(false);
  const [ loginFeedback, setLoginFeedback ] = useState(null);
  const [ showPassword, setShowPassword ] = useState(true);

  const [ credentials, setCredentials ] = useState({
    email: '',
    password: ''
  });

  useLayoutEffect(() => {
    if ( isLoggedIn ) navigation.navigate('Home');
  }, [ isLoggedIn ]);

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
    logIn({
      email: credentials['email'],
      password: credentials['password']
    }, ( success, err ) => {
      if ( success ) {
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

    });

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
      <StatusBar backgroundColor={COLORS.VILO_BRAND_COLOR}/>
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

function TodoItem({ id, title, completed }) {

  return (
    <TouchableRipple
      style={{
        backgroundColor: completed ? '#e7ffe4' : 'white',
        borderTopColor: '#d2d2d2',
        borderTopWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 20
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {completed && (
          <View
            style={{
              position: "absolute",
              right: 0,
              width: 30,
              height: 30,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              // borderBottomWidth: i === consultorios.length - 1 ? 0 : 2,
              // borderBottomColor: "gray"
            }}
          >
            <Text style={{ width: 23, height: 23, padding: 5, backgroundColor: 'green' , borderRadius: 30, justifyContent: 'center', textAlign: 'center' }}>
              <Fa style={{ position: 'relative' }} name="check" color="white" size={13}/>
            </Text>
          </View>
        )}
        <View>
          <Text style={[ styles.paragraph, { color: 'black', marginBottom: 3, width: '80%' } ]}>
            {id}: { title }
          </Text>
          <Text style={[ styles.paragraph, { color: 'black', marginBottom: 3, width: '80%' } ]}>
            Completed: { completed ? 'Yes' : 'No' }
          </Text>
        </View>
      </View>
    </TouchableRipple>
  );
}

function ViloHomeScreen({ navigation }) {

  const PAGE_SIZE = 10;

  const [ todos, setTodos ] = useState([]);
  const [ todosAllReached, setTodosAllReached ] = useState(false);
  const [ showBy, setShowBy ] = useState('all');
  const [ searchingText, setSearchingText ] = useState('');
  const [ page, setPage ] = useState(1);
  const [ isSearching, setIsSearching ] = useState(false);
  const [ isFetchingTodos, setIsFetchingTodos ] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, [ page ]);

  const refreshTodos = useCallback(async () => {
    try {
      setTodos([]);
      setTodosAllReached(false);
    } catch ( err ) {
      
    } finally {
      if ( page !== 1 ) {
        setPage(1);
        return;
      }

      fetchTodos();
    }
  }, [ todos ]);

  const fetchTodos = async () => {
    let response;

    try {
      setIsFetchingTodos(true);
      response = await axios.get('https://jsonplaceholder.typicode.com/todos'
        , {
          params: {
            _page: page,
            _limit: PAGE_SIZE,
            // userId: 20
          }
        }
      );

      if ( response ) {
        if ( response.data.length === 0 ) setTodosAllReached(true);

        setTodos(todos => [
          ...todos,
          ...response.data
        ]);
      }
    } catch ( err ) {
      Alert.alert(
        'HTTP Error',
        'There was as an error while fetching TODOs.'
      );
    } finally {
      setIsFetchingTodos(false);
    }
  };

  const fetchMoreTodos = () => {
    if ( ! isFetchingTodos ) {
      if ( todos.length > 0 && ! todosAllReached ) {
        setPage(prevPage => prevPage + 1);
      }
    }
  };

  const searchFilter = useCallback(text => {
    setSearchingText(text);

    if ( searchingText !== "" ) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

  }, [ searchingText ]);

  const searchingTodos = isSearching
    && todos.filter(t => t.title.match(new RegExp(searchingText, "i")));    

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ backgroundColor: '#def0ff' }}>
        <View>
          <Searchbar
            style={styles.searchBar}
            placeholder="Search"
            onChangeText={searchFilter}
            value={searchingText}
          />
        </View>
        <View
          style={{
            position: 'relative',
            paddingVertical: 8,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Text>Show by: </Text>
          <Text>All</Text>
          <RadioButton
            value="all"
            color={COLORS.VILO_BRAND_COLOR}
            status={showBy === 'all' ? 'checked' : 'unchecked'}
            onPress={() => setShowBy('all')}
          />
          <Text>Completed </Text>
          <RadioButton
            value="completed"
            color={COLORS.VILO_BRAND_COLOR}
            status={showBy === 'completed' ? 'checked' : 'unchecked'}
            onPress={() => setShowBy('completed')}
          />
          <Text>Uncompleted:</Text>
          <RadioButton
            value="uncompleted"
            color={COLORS.VILO_BRAND_COLOR}
            status={showBy === 'uncompleted' ? 'checked' : 'unchecked'}
            onPress={() => setShowBy('uncompleted')}
          />
          <Animated.View style={{ position: 'absolute', right: 20 }}>
            <Pressable onPress={refreshTodos}>
              <Fa5 name="sync" color="black" size={17}/>
            </Pressable>
          </Animated.View>
        </View>
      </View>
      {/* {isFetchingTodos && <ActivityIndicator color={COLORS.VILO_BRAND_COLOR} size={48}/>} */}
      {!isFetchingTodos && todos.length === 0 && <Text>There are no TODOs.</Text>}
      {/* {todos.length > 0 && !isFetchingTodos && ( */}
        <FlatList
          data={searchingTodos || todos}
          keyExtractor={todo => todo.id}
          onEndReached={fetchMoreTodos}
          onEndReachedThreshold={0}
          ListFooterComponent={isFetchingTodos && <ActivityIndicator color={COLORS.VILO_BRAND_COLOR} size={48}/>}
          ListFooterComponentStyle={{ paddingVertical: 40 }}
          renderItem={({ item }) => {
            if ( showBy === 'all' ) {
              return (
                <TodoItem
                  title={item.title}
                  id={item.id}
                  completed={item.completed}
                />
              );
            }

            if ( showBy === 'completed' && item.completed ) {
              return (
                <TodoItem
                  title={item.title}
                  id={item.id}
                  completed={item.completed}
                />
              );
            }

            if ( showBy === 'uncompleted' && !item.completed ) {
              return (
                <TodoItem
                  title={item.title}
                  id={item.id}
                  completed={item.completed}
                />
              );
            }

          }}
        />
      {/* )} */}
    </SafeAreaView>
  );
}

export default App;
