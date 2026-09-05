import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Check,
  Brain,
} from "lucide-react";

import useWorkspaceStore from "../../store/workspaceStore";
import { useUpload } from "../../hooks/useUpload";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/workspace", icon: FlaskConical, label: "Workspace" },
  { to: "/library", icon: BookOpen, label: "Library" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const {
    papers,
    selectedPaperIds,
    togglePaper,
    sidebarCollapsed,
    toggleSidebar,
  } = useWorkspaceStore();

  const { upload, isUploading } = useUpload();

  const navigate = useNavigate();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => upload(file));
    },
    [upload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div {...getRootProps()} className="h-screen relative flex-shrink-0">
      <input {...getInputProps()} />

      <motion.aside
        animate={{
          width: sidebarCollapsed ? 72 : 280,
        }}
        transition={{
          duration: 0.3,
        }}
        className="h-full flex flex-col border-r border-border-subtle bg-bg-surface relative"
      >
        {isDragActive && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl border-2 border-dashed border-accent-primary bg-accent-primary/10">
            <p className="font-medium text-accent-primary">
              Drop PDFs here
            </p>
          </div>
        )}

        {/* Logo */}

        <div className="border-b border-border-subtle p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary">
            <Brain className="h-5 w-5 text-white" />
          </div>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap font-bold text-text-primary"
              >
                Research AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}

        <nav className="space-y-1 p-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? "bg-accent-primary/10 text-accent-primary"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />

              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap text-sm font-medium"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Upload */}

        <div className="px-3 mt-2">
          <button
            onClick={() => navigate("/library")}
            disabled={isUploading}
            className={`w-full rounded-xl border border-accent-primary/20 bg-accent-primary/10 px-3 py-2.5 text-sm font-medium text-accent-primary transition hover:bg-accent-primary/20 ${
              sidebarCollapsed
                ? "flex justify-center"
                : "flex items-center gap-2"
            }`}
          >
            <Upload className="h-4 w-4" />

            {!sidebarCollapsed && (
              <span>
                {isUploading ? "Uploading..." : "Upload Paper"}
              </span>
            )}
          </button>
        </div>

        {/* Papers */}

        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex-1 overflow-y-auto px-3"
            >
              {papers.length > 0 && (
                <p className="mb-2 px-1 text-xs uppercase tracking-wider text-text-muted">
                  Papers ({papers.length})
                </p>
              )}

              <div className="space-y-1">
                {papers.map((paper) => {
                  const selected = selectedPaperIds.includes(paper.id);

                  return (
                    <motion.button
                      key={paper.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => togglePaper(paper.id)}
                      className={`group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition ${
                        selected
                          ? "bg-accent-primary/10 text-accent-primary"
                          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                      }`}
                    >
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          selected
                            ? "border-accent-primary bg-accent-primary"
                            : "border-border-subtle"
                        }`}
                      >
                        {selected && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>

                      <FileText className="h-3.5 w-3.5" />

                      <span className="truncate">
                        {paper.original_name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse */}

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated transition hover:bg-bg-surface"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </motion.aside>
    </div>
  );
}