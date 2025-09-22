

import {
  BorderRadius,
  Colors,
  ComponentThemes,
  Shadows,
  Spacing,
} from "@/src/constants/theme";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
  useColorScheme,
} from "react-native";





export type CardVariant = "default" | "elevated" | "outlined";

export interface BaseCardProps {
  variant?: CardVariant;
  padding?: keyof typeof Spacing;
  margin?: keyof typeof Spacing;
  radius?: keyof typeof BorderRadius;
}

export interface CardProps extends BaseCardProps, ViewProps {
  children: React.ReactNode;
}

export interface TouchableCardProps
  extends BaseCardProps,
    Omit<TouchableOpacityProps, "children"> {
  children: React.ReactNode;
  disabled?: boolean;
}





export const Card: React.FC<CardProps> = ({
  variant = "default",
  children,
  style,
  padding = "md",
  margin,
  radius = "md",
  ...props
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  
  const cardTheme = ComponentThemes.card[variant][theme];

  
  const cardStyles = [
    styles.base,
    {
      backgroundColor: cardTheme.backgroundColor,
      borderRadius: BorderRadius[radius],
      padding: Spacing[padding],
    },
    margin && { margin: Spacing[margin] },
    
    variant === "outlined" && {
      borderWidth: 1,
      borderColor: cardTheme.borderColor,
    },
    
    variant === "elevated" && {
      ...Shadows.md,
      shadowColor: cardTheme.shadowColor,
      shadowOpacity: cardTheme.shadowOpacity,
    },
    style,
  ];

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};





export const TouchableCard: React.FC<TouchableCardProps> = ({
  variant = "default",
  children,
  style,
  padding = "md",
  margin,
  radius = "md",
  disabled = false,
  onPress,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  
  const cardTheme = ComponentThemes.card[variant][theme];

  
  const cardStyles = [
    styles.base,
    styles.touchable,
    {
      backgroundColor: cardTheme.backgroundColor,
      borderRadius: BorderRadius[radius],
      padding: Spacing[padding],
    },
    margin && { margin: Spacing[margin] },
    
    variant === "outlined" && {
      borderWidth: 1,
      borderColor: cardTheme.borderColor,
    },
    
    variant === "elevated" && {
      ...Shadows.md,
      shadowColor: cardTheme.shadowColor,
      shadowOpacity: cardTheme.shadowOpacity,
    },
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={cardStyles}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      onPress={onPress}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};





export interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  style,
  padding = "md",
  ...props
}) => {
  const headerStyles = [styles.header, { padding: Spacing[padding] }, style];

  return (
    <View style={headerStyles} {...props}>
      {children}
    </View>
  );
};





export interface CardContentProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  style,
  padding = "md",
  ...props
}) => {
  const contentStyles = [styles.content, { padding: Spacing[padding] }, style];

  return (
    <View style={contentStyles} {...props}>
      {children}
    </View>
  );
};





export interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  style,
  padding = "md",
  ...props
}) => {
  const colorScheme = useColorScheme();

  const footerStyles = [
    styles.footer,
    {
      padding: Spacing[padding],
      borderTopColor: Colors[colorScheme ?? "light"].border,
    },
    style,
  ];

  return (
    <View style={footerStyles} {...props}>
      {children}
    </View>
  );
};





const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  touchable: {
    
  },
  disabled: {
    opacity: 0.5,
  },
  header: {
    
  },
  content: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
});






export const ElevatedCard: React.FC<Omit<CardProps, "variant">> = (props) => (
  <Card variant="elevated" {...props} />
);


export const OutlinedCard: React.FC<Omit<CardProps, "variant">> = (props) => (
  <Card variant="outlined" {...props} />
);


export const TouchableElevatedCard: React.FC<
  Omit<TouchableCardProps, "variant">
> = (props) => <TouchableCard variant="elevated" {...props} />;


export const TouchableOutlinedCard: React.FC<
  Omit<TouchableCardProps, "variant">
> = (props) => <TouchableCard variant="outlined" {...props} />;

export default Card;
