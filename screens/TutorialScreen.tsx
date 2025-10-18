import React from 'react';
import { Image, View, useWindowDimensions, StyleSheet, ScrollView } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '../context/ThemeContext';

type Props = {
  onFinish: () => void;
};

const TutorialScreen: React.FC<Props> = ({ onFinish }) => {
  const { width, height } = useWindowDimensions();
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';

  const finishTutorial = async () => {
    await AsyncStorage.setItem('alreadyLaunched', 'true');
    onFinish();
  };

  const getImage = (name: string) => {
    if (isDark) {
      switch (name) {
        case 'Home':
          return require('../assets/dark_screen_images/Home_Dark.jpg');
        case 'Add_Message':
          return require('../assets/dark_screen_images/Add_Message_Dark.jpg');
        case 'Drive_Details':
          return require('../assets/dark_screen_images/Drive_Details_Dark.jpg');
        case 'Drive_Rounds':
          return require('../assets/dark_screen_images/Drive_Rounds_Dark.jpg');
        case 'Analytics':
          return require('../assets/dark_screen_images/Analytics_Dark.jpg');
        default:
          return require('../assets/dark_screen_images/Home_Dark.jpg');
      }
    } else {
      switch (name) {
        case 'Home':
          return require('../assets/light_screen_images/Home_Light.jpg');
        case 'Add_Message':
          return require('../assets/light_screen_images/Add_Message_Light.jpg');
        case 'Drive_Details':
          return require('../assets/light_screen_images/Drive_Details_Light.jpg');
        case 'Drive_Rounds':
          return require('../assets/light_screen_images/Drive_Rounds_Light.jpg');
        case 'Analytics':
          return require('../assets/light_screen_images/Analytics_Light.jpg');
        default:
          return require('../assets/light_screen_images/Home_Light.jpg');
      }
    }
  };

  // Image wrapper fixed height
  const renderImage = (name: string) => (
    <View style={[styles.imageWrapper, { height: height * 0.45 }]}>
      <Image
        source={getImage(name)}
        style={{
          width: width * 0.9,
          height: '100%',
          resizeMode: 'contain',
        }}
      />
    </View>
  );

  const pages = [
    {
      backgroundColor: isDark ? '#1e1e1e' : '#a6e4d0',
      imageName: 'Home',
      title: 'Track Placements Easily',
      subtitle:
        'Your dashboard organizes all placements neatly and gives you instant access to updates.',
    },
    {
      backgroundColor: isDark ? '#2a2a2a' : '#fdeb93',
      imageName: 'Add_Message',
      title: 'Add Messages Instantly',
      subtitle:
        'Paste raw placement messages and convert them into structured data — even offline, with auto-sync when you reconnect.',
    },
    {
      backgroundColor: isDark ? '#242424' : '#ffd6a5',
      imageName: 'Drive_Details',
      title: 'View Drive Details',
      subtitle:
        'Explore detailed insights for each drive — from recruiters to results — all in one screen.',
    },
    {
      backgroundColor: isDark ? '#303030' : '#e9bcbe',
      imageName: 'Drive_Rounds',
      title: 'Track Drive Rounds',
      subtitle:
        'Stay informed about every round’s progress and update statuses in real time.',
    },
    {
      backgroundColor: isDark ? '#121212' : '#b5e2fa',
      imageName: 'Analytics',
      title: 'Analyze & Improve',
      subtitle:
        'Visualize your placement performance and discover areas for improvement through smart analytics.',
    },
    {
      backgroundColor: isDark ? '#000' : '#fff',
      imageName: 'Home',
      title: 'Ready to Begin?',
      subtitle: 'Let’s get started and make your placement tracking simple, smart, and seamless.',
    },
  ];

  return (
    <Onboarding
      onSkip={finishTutorial}
      onDone={finishTutorial}
      bottomBarHighlight={false}
      nextLabel="Next"
      skipLabel="Skip"
      doneLabel="Continue"
      titleStyles={{
        fontSize: width > 380 ? 26 : 22,
        fontWeight: '700',
        color: isDark ? '#fff' : '#222',
        marginTop: 10,
        marginBottom: 8,
        textAlign: 'center',
      }}
      subTitleStyles={{
        fontSize: width > 380 ? 17 : 15,
        color: isDark ? '#ccc' : '#444',
        maxWidth: width * 0.9,
        textAlign: 'center',
        lineHeight: 22,
        alignSelf: 'center',
      }}
      pages={pages.map(page => ({
        backgroundColor: page.backgroundColor,
        image: renderImage(page.imageName),
        title: page.title,
        subtitle: page.subtitle,
      }))}
    />
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TutorialScreen;
