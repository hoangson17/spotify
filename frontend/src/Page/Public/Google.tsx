import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginWithGoogle } from "../../stores/actions/authActions";

const Google = () => {
  const [searchParams] = useSearchParams();
  const accessTokenFromGoogle = searchParams.get("accessToken");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!accessTokenFromGoogle) return;

    const handleGoogleLogin = async () => {
      try {
        // Gọi action loginWithGoogle
        await dispatch<any>(loginWithGoogle(accessTokenFromGoogle));

        // Nếu thành công, chuyển hướng
        navigate("/");
      } catch (error) {
        console.error("Google login failed:", error);
        alert("Đăng nhập Google thất bại!");
      }
    };

    handleGoogleLogin();
  }, [accessTokenFromGoogle, dispatch, navigate]);

  return null;
};

export default Google;
