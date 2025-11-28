import React, { useState, useEffect } from "react";
import { InputCustom } from "@/components/InputCustom";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import icons from "../../utils/icons";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "@/stores/actions/authActions";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";

const { FaSpotify } = icons;

interface AuthProps {
  type: "login" | "register";
}

const Auth: React.FC<AuthProps> = ({ type }) => {
  const isLogin = type === "login"; // dựa vào route prop
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    name: "",
    password: "",
    avatar: "",
  });
  const [errors, setErrors] = useState<any>({});

  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { user, error } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isLogin) {
      if (!loginForm.email.trim()) errs.email = "Vui lòng nhập email";
      else if (!emailRegex.test(loginForm.email))
        errs.email = "Email không hợp lệ";

      if (!loginForm.password.trim()) errs.password = "Vui lòng nhập mật khẩu";
      else if (loginForm.password.length < 6)
        errs.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else {
      if (!registerForm.email.trim()) errs.email = "Vui lòng nhập email";
      else if (!emailRegex.test(registerForm.email))
        errs.email = "Email không hợp lệ";

      if (!registerForm.name.trim()) errs.name = "Vui lòng nhập họ tên";
      else if (registerForm.name.length < 3)
        errs.name = "Tên phải có ít nhất 3 ký tự";

      if (!registerForm.password.trim())
        errs.password = "Vui lòng nhập mật khẩu";
      else if (registerForm.password.length < 6)
        errs.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (isLogin) {
      dispatch(login(loginForm.email, loginForm.password));
    } else {
      try {
        await dispatch(register(registerForm));
        setRegisterForm({ email: "", name: "", password: "", avatar: "" });
        navigate("/login");
      } catch (err: any) {}
    }
  };

  // Forgot Password
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);

  const [fpEmail, setFpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const sendForgotEmail = async (e: any) => {
    e.preventDefault();

    try {
      const res = await authService.forgotPassword(fpEmail);

      if (res.data.success) {
        toast.success(res.data.message);
        setEmailDialogOpen(false);

        setTimeout(() => setOtpDialogOpen(true), 60);
      } else {
        toast.error("Lỗi gửi OTP!");
      }
    } catch (err) {
      toast.error("Lỗi gửi OTP!");
    }
  };

  const submitResetPassword = async (e: any) => {
    e.preventDefault();

    try {
      const res = await authService.resetPassword({
        email: fpEmail,
        otp,
        newPassword,
      });

      if (res.data.success) {
        toast.success("Đổi mật khẩu thành công!");
        setOtpDialogOpen(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Lỗi đặt lại mật khẩu!");
    }
  };

  return (
    <div className="bg-black flex flex-col items-center justify-center h-screen">
      <div className="max-w-[400px] flex flex-col items-center gap-2">
        <FaSpotify fontSize={38} className="text-white" />
        <h1 className="text-[40px] text-white font-[700]">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        <div className="flex flex-col gap-4 w-full">
          {/* Email */}
          <InputCustom
            label="Email"
            name="email"
            type="email"
            value={isLogin ? loginForm.email : registerForm.email}
            onChange={(e) =>
              isLogin
                ? setLoginForm({ ...loginForm, email: e.target.value })
                : setRegisterForm({ ...registerForm, email: e.target.value })
            }
            className={`w-full ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}

          {!isLogin && (
            <>
              <InputCustom
                label="Full name"
                name="name"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
                className={`w-full ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </>
          )}

          <InputCustom
            label="Password"
            name="password"
            type="password"
            value={isLogin ? loginForm.password : registerForm.password}
            onChange={(e) =>
              isLogin
                ? setLoginForm({ ...loginForm, password: e.target.value })
                : setRegisterForm({ ...registerForm, password: e.target.value })
            }
            className={`w-full ${errors.password ? "border-red-500" : ""}`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}

          <Button
            onClick={handleSubmit}
            className="bg-[#1DB954] hover:bg-[#1ED760] hover:scale-102 text-black font-semibold"
          >
            {isLogin ? "Sign in" : "Sign up"}
          </Button>

          <div className="text-center">
            <p className="text-white font-bold">or</p>
          </div>

          <a
            href={`${import.meta.env.VITE_SERVER_API}/auth/google/redirect`}
            className="flex items-center justify-center gap-2 hover:scale-102 text-white font-semibold border border-white rounded-md py-2 transition-transform"
          >
            <FcGoogle size={25} />
            Continue with Google
          </a>

          <div className="flex items-center gap-2 flex-col text-center mt-2">
            <Link
              to={isLogin ? "/register" : "/login"}
              className="text-[#8c8b8b] font-bold cursor-pointer"
            >
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Link>
            <Link
              to={isLogin ? "/register" : "/login"}
              className="text-white text-xl font-bold cursor-pointer"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </div>
          <div>
            {/* FORGOT PASSWORD */}
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-transparent hover:bg-transparent cursor-pointer w-full text-white underline">
                  Forgot password?
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Quên mật khẩu</DialogTitle>
                  <DialogDescription>
                    Nhập email để nhận mã OTP đặt lại mật khẩu
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={sendForgotEmail} className="grid gap-4">
                  <div className="grid gap-3">
                    <Label>Email</Label>
                    <Input
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      type="email"
                      placeholder="abc@gmail.com"
                      required
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Hủy</Button>
                    </DialogClose>
                    <Button type="submit">Tiếp tục</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* OTP + NEW PASSWORD DIALOG */}
            <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nhập mã OTP</DialogTitle>
                  <DialogDescription>
                    Mã OTP đã gửi đến email: {fpEmail}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={submitResetPassword} className="grid gap-4">
                  {/* OTP */}
                  <div className="grid gap-3">
                    <Label>OTP</Label>
                    <Input
                      type="text"
                      value={otp}
                      maxLength={6}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Nhập mã 6 số"
                      required
                    />
                  </div>

                  {/* New Password */}
                  <div className="grid gap-3">
                    <Label>Mật khẩu mới</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      required
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Hủy</Button>
                    </DialogClose>
                    <Button type="submit">Đặt lại mật khẩu</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
