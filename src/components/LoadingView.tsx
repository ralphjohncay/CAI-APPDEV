import React from 'react';
import {ActivityIndicator, View, type ViewStyle} from 'react-native';
import {colors} from '../theme/colors';

interface LoadingViewProps {
  style?: ViewStyle;
}

const LoadingView = ({style}: LoadingViewProps): React.JSX.Element => (
  <View style={[{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}, style]}>
    <ActivityIndicator size="large" color={colors.accent} />
  </View>
);

export default LoadingView;
