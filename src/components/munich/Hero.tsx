import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 to-purple-950 px-4 text-white">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left Container */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col gap-6 text-center md:text-left"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold">
                            Join <span className="text-purple-400">Us!</span>
                        </h1>
                        <p className="text-lg md:text-xl">
                            Are you a young innovator passionate about making a difference?
                        </p>
                        <div className="font-semibold text-lg md:text-xl">We're here to bridge the gap by connecting you with key stakeholders in your field. Together, we can harness the power of AI for transformative, interdisciplinary projects that drive tangible social change.</div>
                        <div className="flex flex-col items-center md:items-start gap-4 mt-4">
                            <Button asChild variant="primary" className="px-8 py-4 text-lg">
                                <a href="/">Applications are closed!</a>
                            </Button>
                            <p className="text-sm">Application will open in fall 2025</p>
                        </div>
                    </motion.div>

                    {/* Right Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="hidden md:flex items-center justify-center"
                    >
                        <img
                            src="/assets/logo_new_white_standard.png"
                            alt="TUM.ai Logo"
                            className="w-full max-w-md"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    )
} 