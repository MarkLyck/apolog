import type { Transaction } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import type { ClipboardEvent, DragEvent } from "react";
import { FiAlertTriangle, FiImage, FiUploadCloud, FiX } from "react-icons/fi";

import {
  allowedImageTypes,
  imageFileProblem,
  imageUploadRoute,
} from "@/lib/image-upload";

type ImageUploadState =
  | { status: "idle" }
  | { fileName: string; status: "uploading" }
  | { message: string; status: "failed" };

type ImageUploadOutcome =
  | {
      image: { height: number; src: string; width: number };
      status: "uploaded";
    }
  | { message: string; status: "failed" };

async function naturalSize(file: File) {
  const bitmap = await createImageBitmap(file);
  const size = { height: bitmap.height, width: bitmap.width };
  bitmap.close();
  return size;
}

async function uploadArticleImage(file: File): Promise<ImageUploadOutcome> {
  const problem = imageFileProblem(file);
  if (problem) {
    return { message: problem, status: "failed" };
  }
  const size = await naturalSize(file).catch(() => null);
  if (!size) {
    return {
      message: "That file could not be read as an image.",
      status: "failed",
    };
  }
  try {
    const blob = await upload(`articles/${file.name}`, file, {
      access: "public",
      contentType: file.type,
      handleUploadUrl: imageUploadRoute,
    });
    return { image: { ...size, src: blob.url }, status: "uploaded" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      message: message.includes("client token")
        ? "Upload was not authorized. Sign in again as an administrator."
        : `Upload failed: ${message}`,
      status: "failed",
    };
  }
}

function imageFiles(files: FileList) {
  return [...files].filter((file) => file.type.startsWith("image/"));
}

export function useImageUpload(editor: Editor | null) {
  const [state, setState] = useState<ImageUploadState>({ status: "idle" });

  const insertImages = async (files: File[]) => {
    if (!editor || state.status === "uploading") {
      return;
    }
    let position = editor.state.selection.to;
    const followEdits = ({ transaction }: { transaction: Transaction }) => {
      position = transaction.mapping.map(position);
    };
    editor.on("transaction", followEdits);
    try {
      for (const file of files) {
        setState({ fileName: file.name, status: "uploading" });
        const outcome = await uploadArticleImage(file);
        if (outcome.status === "failed") {
          setState({
            message: `${file.name}: ${outcome.message}`,
            status: "failed",
          });
          return;
        }
        editor.commands.insertContentAt(position, {
          attrs: { ...outcome.image, alt: "", caption: null },
          type: "image",
        });
      }
    } finally {
      editor.off("transaction", followEdits);
    }
    setState({ status: "idle" });
  };

  return {
    handleDismiss: () => setState({ status: "idle" }),
    handleFiles: insertImages,
    handleDrop: (event: DragEvent) => {
      const files = imageFiles(event.dataTransfer.files);
      if (!editor || !files.length) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const dropPosition = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });
      if (dropPosition) {
        editor.commands.setTextSelection(dropPosition.pos);
      }
      void insertImages(files);
    },
    handlePaste: (event: ClipboardEvent) => {
      const files = imageFiles(event.clipboardData.files);
      if (!editor || !files.length) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      void insertImages(files);
    },
    state,
  };
}

export function ImageUploadButton({
  onFiles,
}: {
  onFiles: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        aria-label="Insert image"
        className="editor-toolbar-button"
        onClick={() => input.current?.click()}
        title="Insert image"
        type="button"
      >
        <FiImage aria-hidden="true" /> <span>Image</span>
      </button>
      <input
        accept={allowedImageTypes.join(",")}
        aria-hidden="true"
        className="hidden"
        multiple
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          onFiles(files);
        }}
        ref={input}
        tabIndex={-1}
        type="file"
      />
    </>
  );
}

export function ImageUploadStatus({
  onDismiss,
  state,
}: {
  onDismiss: () => void;
  state: ImageUploadState;
}) {
  if (state.status === "uploading") {
    return (
      <output className="editor-upload-status" data-status="uploading">
        <FiUploadCloud aria-hidden="true" /> Uploading {state.fileName}…
      </output>
    );
  }
  if (state.status === "failed") {
    return (
      <div className="editor-upload-status" data-status="failed" role="alert">
        <FiAlertTriangle aria-hidden="true" /> {state.message}
        <button
          aria-label="Dismiss upload error"
          onClick={onDismiss}
          type="button"
        >
          <FiX aria-hidden="true" />
        </button>
      </div>
    );
  }
  return null;
}
