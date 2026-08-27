import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";

import {
  ChevronLeftIcon,
  EyeCloseIcon,
  EyeIcon,
} from "../../icons";

import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

import { login } from "../../api/auth.api";

interface ApiErrorResponse {
  message?: string;
}

export default function SignInForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");

    const trimmedUsername = username.trim();

    // Validate
    if (!trimmedUsername) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }

    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setIsLoading(true);

      console.log("LOGIN REQUEST:", {
        username: trimmedUsername,
      });

      const response = await login({
        username: trimmedUsername,
        password,
      });

      console.log("LOGIN SUCCESS:", response);

      /**
       * login() đã xử lý:
       *
       * 1. POST /auth/login
       * 2. Backend set refresh_token vào HttpOnly Cookie
       * 3. Lưu access token vào memory
       */

      navigate("/", {
        replace: true,
      });
    } catch (error: unknown) {
      console.error("LOGIN ERROR:", error);

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const message =
          error.response?.data?.message ??
          "Tên đăng nhập hoặc mật khẩu không chính xác.";

        setErrorMessage(message);
      } else {
        setErrorMessage(
          "Đã xảy ra lỗi. Vui lòng thử lại."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Back to dashboard */}
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      {/* Form container */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Header */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <div>
            {/* Social login */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                Sign in with Google
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                Sign in with X
              </button>
            </div>

            {/* Divider */}
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <Label>
                    Email{" "}
                    <span className="text-error-500">
                      *
                    </span>
                  </Label>

                  <Input
                    type="text"
                    placeholder="info@gmail.com"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div>
                  <Label>
                    Password{" "}
                    <span className="text-error-500">
                      *
                    </span>
                  </Label>

                  <div className="relative">
                    <Input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      disabled={isLoading}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      disabled={isLoading}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 disabled:cursor-not-allowed"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="p-3 text-sm text-red-500 rounded-lg bg-red-50 dark:bg-red-500/10"
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Remember me */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isChecked}
                      onChange={setIsChecked}
                    />

                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>

                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Signing in..."
                      : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            {/* Sign up */}
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}