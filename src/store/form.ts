

import { APP_CONFIG } from "@/src/config/app";
import type { MultiStepFormState, ProductCreateData } from "@/src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";

interface FormStore {
  
  productForm: MultiStepFormState & {
    data: Partial<ProductCreateData>;
  };

  
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<ProductCreateData>) => void;
  markStepComplete: (stepIndex: number, isValid: boolean) => void;
  validateCurrentStep: () => boolean;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  nextStep: () => boolean;
  previousStep: () => boolean;
  resetForm: () => void;
  saveDraft: () => void;
  loadDraft: () => void;
  clearDraft: () => void;
}

const createInitialProductFormState = (): FormStore["productForm"] => ({
  currentStep: 0,
  steps: APP_CONFIG.FORMS.STEPS.PRODUCT_CREATE.map((step, index) => ({
    id: step.id,
    title: step.title,
    isValid: false,
    isCompleted: false,
  })),
  formData: {},
  canGoNext: false,
  canGoPrevious: false,
  data: {
    title: "",
    description: "",
    categoryIds: [],
    images: [],
    purchasePrice: undefined,
    rentPrice: undefined,
    rentType: undefined,
    availableForSale: false,
    availableForRent: false,
    condition: "GOOD",
    location: "",
  },
});

export const useFormStore = create<FormStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Initial state
      productForm: createInitialProductFormState(),

      // Actions
      setCurrentStep: (step: number) => {
        const { productForm } = get();
        const maxStep = productForm.steps.length - 1;
        const newStep = Math.max(0, Math.min(step, maxStep));

        set((state) => ({
          productForm: {
            ...state.productForm,
            currentStep: newStep,
            canGoNext: get().canGoNext(),
            canGoPrevious: get().canGoPrevious(),
          },
        }));
      },

      updateFormData: (data: Partial<ProductCreateData>) => {
        set((state) => ({
          productForm: {
            ...state.productForm,
            data: { ...state.productForm.data, ...data },
            formData: { ...state.productForm.formData, ...data },
          },
        }));

        // Validate current step after data update
        get().validateCurrentStep();

        // Auto-save draft
        setTimeout(() => {
          get().saveDraft();
        }, 1000);
      },

      markStepComplete: (stepIndex: number, isValid: boolean) => {
        set((state) => {
          const newSteps = [...state.productForm.steps];
          if (newSteps[stepIndex]) {
            newSteps[stepIndex] = {
              ...newSteps[stepIndex],
              isValid,
              isCompleted: isValid,
            };
          }

          return {
            productForm: {
              ...state.productForm,
              steps: newSteps,
              canGoNext: get().canGoNext(),
            },
          };
        });
      },

      validateCurrentStep: () => {
        const { productForm } = get();
        const currentStep = productForm.steps[productForm.currentStep];
        const formData = productForm.data;

        let isValid = false;

        switch (currentStep?.id) {
          case "basic":
            isValid = !!(
              formData.title &&
              formData.title.length >= 3 &&
              formData.title.length <= APP_CONFIG.FORMS.MAX_TITLE_LENGTH &&
              formData.description &&
              formData.description.length >= 10 &&
              formData.description.length <=
                APP_CONFIG.FORMS.MAX_DESCRIPTION_LENGTH &&
              formData.condition
            );
            break;

          case "categories":
            isValid = !!(
              formData.categoryIds && formData.categoryIds.length > 0
            );
            break;

          case "pricing":
            isValid = !!(
              (formData.availableForSale &&
                formData.purchasePrice &&
                formData.purchasePrice > 0) ||
              (formData.availableForRent &&
                formData.rentPrice &&
                formData.rentPrice > 0 &&
                formData.rentType)
            );
            break;

          case "images":
            
            isValid = true;
            break;

          case "review":
            
            isValid = true;
            break;

          default:
            isValid = false;
        }

        get().markStepComplete(productForm.currentStep, isValid);
        return isValid;
      },

      canGoNext: () => {
        const { productForm } = get();
        const currentStepIndex = productForm.currentStep;
        const currentStep = productForm.steps[currentStepIndex];
        const isLastStep = currentStepIndex === productForm.steps.length - 1;

        return !isLastStep && currentStep?.isValid === true;
      },

      canGoPrevious: () => {
        const { productForm } = get();
        return productForm.currentStep > 0;
      },

      nextStep: () => {
        if (get().canGoNext()) {
          const { productForm } = get();
          get().setCurrentStep(productForm.currentStep + 1);
          return true;
        }
        return false;
      },

      previousStep: () => {
        if (get().canGoPrevious()) {
          const { productForm } = get();
          get().setCurrentStep(productForm.currentStep - 1);
          return true;
        }
        return false;
      },

      resetForm: () => {
        set({ productForm: createInitialProductFormState() });
        get().clearDraft();
      },

      saveDraft: () => {
        const { productForm } = get();
        AsyncStorage.setItem(
          APP_CONFIG.STORAGE.DRAFT_PRODUCT_KEY,
          JSON.stringify({
            data: productForm.data,
            currentStep: productForm.currentStep,
            timestamp: Date.now(),
          })
        ).catch((error) => {
          console.error("Failed to save draft:", error);
        });
      },

      loadDraft: async () => {
        try {
          const draftString = await AsyncStorage.getItem(
            APP_CONFIG.STORAGE.DRAFT_PRODUCT_KEY
          );
          if (draftString) {
            const draft = JSON.parse(draftString);
            const timeDiff = Date.now() - draft.timestamp;

            
            if (timeDiff < 24 * 60 * 60 * 1000) {
              set((state) => ({
                productForm: {
                  ...state.productForm,
                  data: { ...state.productForm.data, ...draft.data },
                  formData: { ...state.productForm.formData, ...draft.data },
                  currentStep: draft.currentStep || 0,
                },
              }));

              
              const { productForm } = get();
              for (let i = 0; i <= productForm.currentStep; i++) {
                get().setCurrentStep(i);
                get().validateCurrentStep();
              }
              get().setCurrentStep(draft.currentStep || 0);
            } else {
              
              get().clearDraft();
            }
          }
        } catch (error) {
          console.error("Failed to load draft:", error);
        }
      },

      clearDraft: () => {
        AsyncStorage.removeItem(APP_CONFIG.STORAGE.DRAFT_PRODUCT_KEY).catch(
          (error) => {
            console.error("Failed to clear draft:", error);
          }
        );
      },
    })),
    {
      name: "teebay_form_store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        
        productForm: {
          currentStep: state.productForm.currentStep,
          data: state.productForm.data,
        },
      }),
    }
  )
);


useFormStore.subscribe(
  (state) => state.productForm.data,
  () => {
    
  }
);


export const useProductForm = () => useFormStore((state) => state.productForm);

export const useProductFormActions = () =>
  useFormStore((state) => ({
    setCurrentStep: state.setCurrentStep,
    updateFormData: state.updateFormData,
    validateCurrentStep: state.validateCurrentStep,
    nextStep: state.nextStep,
    previousStep: state.previousStep,
    resetForm: state.resetForm,
    saveDraft: state.saveDraft,
    loadDraft: state.loadDraft,
    clearDraft: state.clearDraft,
  }));

export const useCurrentFormStep = () =>
  useFormStore((state) => {
    const form = state.productForm;
    return {
      current: form.currentStep,
      total: form.steps.length,
      step: form.steps[form.currentStep],
      canGoNext: form.canGoNext,
      canGoPrevious: form.canGoPrevious,
      isFirst: form.currentStep === 0,
      isLast: form.currentStep === form.steps.length - 1,
    };
  });
