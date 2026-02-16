import { useNavigate } from "react-router-dom";

export function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="w-full py-8 mt-12 border-t border-white-10 text-center">
            <div className="max-w-[1400px] mx-auto px-4">
                <p className="text-gray-400 text-sm mb-4">
                    Made By <span className="text-accent-blue font-semibold">Team Stephen Bhawkings</span>
                </p>

                <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 mb-6">
                    <span className="hover:text-white transition-colors cursor-default">Pratham Jain</span>
                    <span className="text-white-10">•</span>
                    <span className="hover:text-white transition-colors cursor-default">Yash Jain</span>
                    <span className="text-white-10">•</span>
                    <span className="hover:text-white transition-colors cursor-default">Krrish Jain</span>
                    <span className="text-white-10">•</span>
                    <span className="hover:text-white transition-colors cursor-default">Vishal S</span>
                </div>

                <div className="flex justify-center gap-6 text-xs font-medium text-gray-400">
                    <button onClick={() => navigate("/about")} className="hover:text-white transition-colors">About Us</button>
                    <a href="https://github.com/pratham-jain" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                </div>
            </div>
        </footer>
    );
}
