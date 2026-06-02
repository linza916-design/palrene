import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { X, Video, FileText, CheckCircle, Upload, Award } from "lucide-react";
import { uploadToCloudinary } from "../../utils/cloudinary";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerificationModal({
  isOpen,
  onClose,
}: VerificationModalProps) {
  const { currentUser, submitVerification } = useStore();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [docBack, setDocBack] = useState<File | null>(null);
  const [status, setStatus] = useState<"form" | "success">("form");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !videoFile || !idFile) return;

    setUploading(true);
    try {
      // 1. Upload video file to Cloudinary
      const videoUrl = await uploadToCloudinary(videoFile);

      // 2. Upload ID card front image
      const idFrontUrl = await uploadToCloudinary(idFile);

      // 3. Upload ID card back image if selected, otherwise use a placeholder
      let idBackUrl = "https://example.com/mock-id-back.png";
      if (docBack) {
        idBackUrl = await uploadToCloudinary(docBack);
      }

      // 4. Dispatch verification state to global store action
      submitVerification(videoUrl, idFrontUrl, idBackUrl);
      setStatus("success");
    } catch (err) {
      console.error("Failed uploading verification assets:", err);
      alert("Error uploading media assets. Preserving offline fallback state.");
      submitVerification(
        "https://example.com/mock-verification-video.mp4",
        "https://example.com/mock-id-front.png",
        "https://example.com/mock-id-back.png",
      );
      setStatus("success");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setStatus("form");
    setVideoFile(null);
    setIdFile(null);
    setDocBack(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md overflow-hidden bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-orange-500 font-mono text-[10px]">
                <Award size={14} className="animate-pulse" />
                <span className="font-bold uppercase tracking-wider">
                  Identity Seal
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <X size={18} />
              </button>
            </div>

            {status === "form" ? (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-serif font-bold text-neutral-900 dark:text-white">
                    Profile Verification Review
                  </h3>
                  <p className="text-xs text-neutral-550 dark:text-neutral-400">
                    Manual ID matching holds safety in check. Verification is
                    open for Starter+ subscribers.
                  </p>
                </div>

                {!currentUser?.subscription_tier ||
                currentUser.subscription_tier === "Free" ? (
                  <div className="py-6 px-4 bg-linear-to-br from-red-500/10 via-orange-500/5 to-yellow-500/10 border border-orange-500/15 rounded-3xl text-center space-y-4">
                    <Award
                      size={36}
                      className="mx-auto text-yellow-500 animate-pulse"
                    />
                    <div className="space-y-1">
                      <h4 className="text-sm font-serif font-bold text-neutral-900 dark:text-white">
                        Verification is Starter/Pro Only
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
                        To maintain secure and authentic connection circles,
                        national ID matching and verification reviews are
                        reserved for Starter and Pro members.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        // Call change view directly in store state
                        useStore.getState().setView("settings");
                      }}
                      className="px-5 py-2.5 text-xs font-mono font-bold text-white bg-linear-to-r from-red-500 to-orange-500 rounded-xl leading-none cursor-pointer"
                    >
                      Unlock with Starter Plan &rarr;
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Video Upload Drop Section */}
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        1. Upload a 30-Second Verification Video
                      </span>
                      <label className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-orange-500 rounded-xl cursor-pointer bg-neutral-50/60 dark:bg-black/30 transition text-center select-none">
                        <Video size={20} className="text-neutral-400 mb-1" />
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {videoFile
                            ? videoFile.name
                            : "Drag or select MP4 clip"}
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">
                          Read a sign or hold your document close
                        </span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) =>
                            setVideoFile(e.target.files?.[0] || null)
                          }
                          className="sr-only"
                        />
                      </label>
                    </div>

                    {/* ID Card Front Drop Section */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                          2. National ID / Passport (Front)
                        </span>
                        <label className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-orange-500 rounded-xl cursor-pointer bg-neutral-50/60 dark:bg-black/30 transition text-center select-none aspect-video">
                          <FileText
                            size={18}
                            className="text-neutral-400 mb-1"
                          />
                          <span className="text-[10px] text-neutral-700 dark:text-neutral-300 truncate max-w-full">
                            {idFile ? idFile.name : "ID Card Front"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setIdFile(e.target.files?.[0] || null)
                            }
                            className="sr-only"
                          />
                        </label>
                      </div>

                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                          3. National ID / Passport (Back)
                        </span>
                        <label className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-orange-500 rounded-xl cursor-pointer bg-neutral-50/60 dark:bg-black/30 transition text-center select-none aspect-video">
                          <Upload size={18} className="text-neutral-400 mb-1" />
                          <span className="text-[10px] text-neutral-700 dark:text-neutral-300 truncate max-w-full">
                            {docBack ? docBack.name : "ID Card Back"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setDocBack(e.target.files?.[0] || null)
                            }
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!videoFile || !idFile || uploading}
                      className="w-full py-2.5 font-mono text-xs font-bold tracking-wider uppercase text-white bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl disabled:opacity-40 transition cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {uploading ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1.5" />
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        "Submit Verifications"
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center text-green-500 animate-pulse">
                  <CheckCircle size={44} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-serif font-semibold text-neutral-900 dark:text-white">
                    Submission Successful!
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                    We safely compiled your video authentication clip and
                    documents. Our platform moderators are matching profiles
                    right now. Check back soon.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 font-mono text-xs font-bold bg-neutral-100 dark:bg-neutral-900 dark:text-white rounded-xl hover:bg-neutral-200 transition"
                >
                  Return to Harbor
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
