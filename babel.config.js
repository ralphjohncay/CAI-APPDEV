module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'transform-inline-environment-variables',
      {include: ['EXPO_PUBLIC_API_URL', 'REACT_NATIVE_PUBLIC_API_URL']},
    ],
  ],
};
