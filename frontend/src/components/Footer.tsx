import {
  Facebook,
  Instagram,
  Twitter,
  Github,
  Music2,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-white/10 bg-[#121212] text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
              <Music2 size={28} />
              <span className="text-xl font-bold">Music</span>
            </div>
            <p className="text-sm leading-6">
              Khám phá âm nhạc, nghệ sĩ và những playlist
              yêu thích của bạn.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Khám phá
            </h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white">Bài hát</a></li>
              <li><a href="#" className="hover:text-white">Album</a></li>
              <li><a href="#" className="hover:text-white">Nghệ sĩ</a></li>
              <li><a href="#" className="hover:text-white">Playlist</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Hỗ trợ
            </h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white">Trợ giúp</a></li>
              <li><a href="#" className="hover:text-white">Liên hệ</a></li>
              <li><a href="#" className="hover:text-white">Điều khoản</a></li>
              <li><a href="#" className="hover:text-white">Bảo mật</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Theo dõi chúng tôi
            </h3>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Github].map(
                (Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition"
                  >
                    <Icon size={18} />
                  </a>
                )
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Music. All rights reserved.</p>
          <p>Made with music ❤️</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
