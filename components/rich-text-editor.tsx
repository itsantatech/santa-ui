"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, type Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type MouseEvent, useEffect, useMemo } from "react";

type RichTextEditorProps = {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  icon?: string;
  label: string;
  onClick: () => void;
};

export function RichTextEditor({
  label,
  onChange,
  placeholder,
  value,
}: RichTextEditorProps) {
  const placeholderText = useMemo(
    () => placeholder ?? label,
    [label, placeholder],
  );

  const editor = useEditor({
    content: value,
    editorProps: {
      attributes: {
        class: "admin-rich-text-surface",
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholderText,
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();

    if (currentHtml !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <label className="admin-product-field admin-product-field-wide">
      <span>{label}</span>
      <div className="admin-rich-text-editor">
        <RichTextToolbar editor={editor} label={label} />
        <EditorContent editor={editor} />
      </div>
    </label>
  );
}

function RichTextToolbar({
  editor,
  label,
}: {
  editor: Editor | null;
  label: string;
}) {
  function promptForLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const nextUrl = window.prompt("Enter URL", previousUrl ?? "");

    if (nextUrl === null) {
      return;
    }

    if (!nextUrl.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: nextUrl }).run();
  }

  return (
    <div className="admin-rich-text-toolbar-shell">
      <div className="admin-rich-text-toolbar" role="toolbar" aria-label={label}>
        <div className="admin-rich-text-toolbar-group">
          <ToolbarButton
            active={editor?.isActive("paragraph") ?? false}
            icon="notes"
            label="Body"
            onClick={() => editor?.chain().focus().setParagraph().run()}
          />
          <ToolbarButton
            active={editor?.isActive("heading", { level: 1 }) ?? false}
            icon="format_h1"
            label="H1"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          />
          <ToolbarButton
            active={editor?.isActive("heading", { level: 2 }) ?? false}
            icon="format_h2"
            label="H2"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <ToolbarButton
            active={editor?.isActive("heading", { level: 3 }) ?? false}
            icon="format_h3"
            label="H3"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          />
        </div>

        <div className="admin-rich-text-toolbar-group">
          <ToolbarButton
            active={editor?.isActive("bold") ?? false}
            icon="format_bold"
            label="Bold"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            active={editor?.isActive("italic") ?? false}
            icon="format_italic"
            label="Italic"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            active={editor?.isActive("underline") ?? false}
            icon="format_underlined"
            label="Underline"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            active={editor?.isActive("strike") ?? false}
            icon="format_strikethrough"
            label="Strike"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          />
        </div>

        <div className="admin-rich-text-toolbar-group">
          <ToolbarButton
            active={editor?.isActive("bulletList") ?? false}
            icon="format_list_bulleted"
            label="Bullet"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            active={editor?.isActive("orderedList") ?? false}
            icon="format_list_numbered"
            label="Number"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            active={editor?.isActive("blockquote") ?? false}
            icon="format_quote"
            label="Quote"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            active={editor?.isActive("codeBlock") ?? false}
            icon="code_blocks"
            label="Code"
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            icon="horizontal_rule"
            label="Divider"
          />
        </div>

        <div className="admin-rich-text-toolbar-group">
          <ToolbarButton
            active={editor?.isActive("link") ?? false}
            icon="link"
            label="Link"
            onClick={promptForLink}
          />
          <ToolbarButton
            disabled={!(editor?.can().chain().focus().undo().run() ?? false)}
            icon="undo"
            label="Undo"
            onClick={() => editor?.chain().focus().undo().run()}
          />
          <ToolbarButton
            disabled={!(editor?.can().chain().focus().redo().run() ?? false)}
            icon="redo"
            label="Redo"
            onClick={() => editor?.chain().focus().redo().run()}
          />
          <ToolbarButton
            icon="format_clear"
            label="Clear"
            onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  active = false,
  disabled = false,
  icon,
  label,
  onClick,
}: ToolbarButtonProps) {
  function keepSelection(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className="admin-rich-text-toolbar-button"
      data-active={active ? "true" : "false"}
      disabled={disabled}
      onMouseDown={keepSelection}
      onClick={onClick}
      type="button"
    >
      {icon ? (
        <span className="material-symbols-outlined" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </button>
  );
}
