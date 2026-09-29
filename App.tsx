import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Image, Platform, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const SITE_URL = 'https://interview-dev-hack.vercel.app/';
const BRAND_BG = '#190A39';
const MIN_SPLASH_MS = 1500;

SplashScreen.preventAutoHideAsync();

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [webLoaded, setWebLoaded] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  // Fade out the branded splash once the site has loaded.
  useEffect(() => {
    if (!webLoaded || !minTimePassed) return;
    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setShowSplash(false));
  }, [webLoaded, minTimePassed, splashOpacity]);

  // Android hardware back button navigates web history.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <WebView
          ref={webViewRef}
          source={{ uri: SITE_URL }}
          style={styles.container}
          onLoadEnd={() => setWebLoaded(true)}
          onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
          allowsBackForwardNavigationGestures
          pullToRefreshEnabled
          sharedCookiesEnabled
          domStorageEnabled
          javaScriptEnabled
          allowsInlineMediaPlayback
          setSupportMultipleWindows={false}
        />
        <StatusBar style={showSplash ? 'light' : 'auto'} />
      </SafeAreaView>

      {showSplash && (
        <Animated.View
          style={[styles.splash, { opacity: splashOpacity }]}
          onLayout={() => SplashScreen.hideAsync()}
        >
          <Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.credit}>Developed by Ganushka Gamage ❤️</Text>
        </Animated.View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  splash: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_BG,
  },
  logo: {
    width: 200,
    height: 200,
  },
  credit: {
    position: 'absolute',
    bottom: 60,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.85,
  },
});
