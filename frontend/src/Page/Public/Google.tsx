import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginWithGoogle } from "../../stores/actions/authActions";

const Google = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const started = useRef(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (started.current) return;
    if (!code) {
      navigate("/login", { replace: true });
      return;
    }
    started.current = true;

    const handleGoogleLogin = async () => {
      try {
        // Gọi action loginWithGoogle
        await dispatch<any>(loginWithGoogle(code));

        // Nếu thành công, chuyển hướng
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Google login failed:", error);
        alert("Đăng nhập Google thất bại!");
        navigate("/login", { replace: true });
      }
    };

    handleGoogleLogin();
  }, [code, dispatch, navigate]);

  return null;
};

export default Google;
