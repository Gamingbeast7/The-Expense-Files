import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "./Button";

export function BackButton() {
    const navigate = useNavigate();
    return (
        <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 pl-0 hover:bg-transparent hover:text-white text-gray-400 gap-2"
        >
            <ArrowLeft size={20} />
            Back to Dashboard
        </Button>
    );
}
