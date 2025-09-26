import { Button } from "@/src/components/common/Button";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export interface FormStep {
  id: number;
  title: string;
  component: React.ComponentType<any>;
  isValid?: boolean;
  isCompleted?: boolean;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isSubmitting?: boolean;
  submitButtonText?: string;
  children: React.ReactNode;
  showStepIndicator?: boolean;
  showStepLabels?: boolean;
  testID?: string;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onSubmit,
  canGoNext,
  canGoPrevious,
  isSubmitting = false,
  submitButtonText = "Submit",
  children,
  showStepIndicator = true,
  showStepLabels = true,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  // const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const isLastStep = currentStep === steps.length - 1;
  // const currentStepData = steps[currentStep];

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex <= currentStep || steps[stepIndex - 1]?.isCompleted) {
      onStepChange(stepIndex);
    }
  };

  // const toggleStepDetails = (stepIndex: number) => {
  //   setExpandedStep(expandedStep === stepIndex ? null : stepIndex);
  // };

  const renderStepIndicator = () => {
    if (!showStepIndicator) return null;

    return (
      <View
        style={[
          styles.stepIndicatorContainer,
          { borderBottomColor: Colors[theme].border },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stepIndicatorContent}
        >
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = step.isCompleted || index < currentStep;
            const isAccessible =
              index <= currentStep || steps[index - 1]?.isCompleted;

            return (
              <View key={step.id} style={styles.stepIndicatorItem}>
                <Pressable
                  style={[
                    styles.stepCircle,
                    { backgroundColor: Colors[theme].tint },
                    isActive && { backgroundColor: Colors[theme].tint },
                    isCompleted &&
                      !isActive && { backgroundColor: Colors[theme].success },
                    !isAccessible && {
                      backgroundColor: Colors[theme].backgroundSecondary,
                    },
                  ]}
                  onPress={() => handleStepPress(index)}
                  disabled={!isAccessible}
                  testID={`step-indicator-${index}`}
                >
                  {isCompleted && !isActive ? (
                    <IconSymbol name="checkmark" size={16} color="white" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        {
                          color:
                            isActive || isCompleted
                              ? "white"
                              : Colors[theme].textSecondary,
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </Pressable>

                {showStepLabels && (
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: isActive
                          ? Colors[theme].tint
                          : isCompleted
                          ? Colors[theme].success
                          : Colors[theme].textSecondary,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {step.title}
                  </Text>
                )}

                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      {
                        backgroundColor: isCompleted
                          ? Colors[theme].success
                          : Colors[theme].border,
                      },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderProgressBar = () => {
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarTrack,
            { backgroundColor: Colors[theme].border },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: Colors[theme].tint,
              },
            ]}
          />
        </View>
        <Text
          style={[styles.progressText, { color: Colors[theme].textSecondary }]}
        >
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>
    );
  };

  const renderNavigationButtons = () => (
    <View
      style={[
        styles.navigationContainer,
        { borderTopColor: Colors[theme].border },
      ]}
    >
      {canGoPrevious && (
        <Button
          title="Previous"
          variant="secondary"
          onPress={onPrevious}
          style={styles.navigationButton}
          testID="previous-button"
          size="sm"
        />
      )}

      <View style={styles.navigationSpacer} />

      {isLastStep ? (
        <Button
          title={submitButtonText}
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting || !canGoNext}
          style={styles.navigationButton}
          testID="submit-button"
          size="sm"
        />
      ) : (
        <Button
          title="Next"
          onPress={onNext}
          disabled={!canGoNext}
          style={styles.navigationButton}
          testID="next-button"
          size="sm"
        />
      )}
    </View>
  );

  // const renderStepDetails = () => (
  //   <View
  //     style={[
  //       styles.stepDetailsContainer,
  //       { borderBottomColor: Colors[theme].border },
  //     ]}
  //   >
  //     <Pressable
  //       style={styles.stepHeader}
  //       onPress={() => toggleStepDetails(currentStep)}
  //     >
  //       <View style={styles.stepHeaderContent}>
  //         <Text style={[styles.stepTitle, { color: Colors[theme].text }]}>
  //           {currentStepData.title}
  //         </Text>
  //         <Text
  //           style={[
  //             styles.stepSubtitle,
  //             { color: Colors[theme].textSecondary },
  //           ]}
  //         >
  //           Step {currentStep + 1} of {steps.length}
  //         </Text>
  //       </View>
  //       <IconSymbol
  //         name={expandedStep === currentStep ? "chevron.up" : "chevron.down"}
  //         size={20}
  //         color={Colors[theme].textSecondary}
  //       />
  //     </Pressable>

  //     {expandedStep === currentStep && (
  //       <View
  //         style={[
  //           styles.stepDescription,
  //           { borderTopColor: Colors[theme].border },
  //         ]}
  //       >
  //         <Text
  //           style={[
  //             styles.stepDescriptionText,
  //             { color: Colors[theme].textSecondary },
  //           ]}
  //         >
  //           Complete this step to continue to the next part of the form.
  //         </Text>
  //       </View>
  //     )}
  //   </View>
  // );

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      testID={testID}
    >
      {renderStepIndicator()}
      {renderProgressBar()}
      {/* {renderStepDetails()} */}

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        {children}
      </ScrollView>

      {renderNavigationButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Step Indicator
  stepIndicatorContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  stepIndicatorContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
  },
  stepIndicatorItem: {
    alignItems: "center",
    position: "relative",
    marginHorizontal: Spacing.sm,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  stepNumber: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  stepLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
    maxWidth: 80,
  },
  stepConnector: {
    position: "absolute",
    top: 20,
    left: 50,
    width: 60,
    height: 2,
    zIndex: -1,
  },

  // Progress Bar
  progressBarContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
  },

  // Step Details
  stepDetailsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepHeaderContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  stepDescription: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  stepDescriptionText: {
    fontSize: Typography.fontSize.sm,
  },

  // Content
  contentContainer: {
    flex: 1,
  },
  contentContainerStyle: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },

  // Navigation
  navigationContainer: {
    flexDirection: "row",
    padding: Spacing.md,
  },
  navigationButton: {
    minWidth: 120,
  },
  navigationSpacer: {
    flex: 1,
  },
});

export default MultiStepForm;
