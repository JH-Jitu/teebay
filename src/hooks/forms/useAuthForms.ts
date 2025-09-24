import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registrationSchema,
  resetPasswordSchema,
  type ChangePasswordFormData,
  type ForgotPasswordFormData,
  type LoginFormData,
  type RegistrationFormData,
  type ResetPasswordFormData,
} from "@/src/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const useLoginForm = () => {
  return useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    delayError: 300, 
    defaultValues: {
      email: "",
      password: "",
    },
  });
};

export const useRegistrationForm = () => {
  return useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    delayError: 300, 
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      address: "",
      termsAccepted: false,
    },
  });
};

export const useChangePasswordForm = () => {
  return useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });
};

export const useForgotPasswordForm = () => {
  return useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
    },
  });
};

export const useResetPasswordForm = () => {
  return useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
      resetToken: "",
    },
  });
};

export type {
  ChangePasswordFormData,
  ForgotPasswordFormData,
  LoginFormData,
  RegistrationFormData,
  ResetPasswordFormData,
};
