"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, type Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type MouseEvent, useEffect, useId, useMemo, useRef } from "react";

type RichTextEditorProps = {
  label: string;
  maxCharacters?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showToolbar?: boolean;
  value: string;
};

type ToolbarButtonProps = {
  active?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  icon?: string;
  label: string;
  onExecute: () => void;
};

export function RichTextEditor({
  label,
  maxCharacters,
  onChange,
  placeholder,
  required = false,
  showToolbar = true,
  value,
}: RichTextEditorProps) {
  const labelId = useId();
  const lastSyncedValueRef = useRef(value);
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
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      Placeholder.configure({
        placeholder: placeholderText,
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      const nextTextLength = countEditorCharacters(currentEditor.getText());

      if (maxCharacters && nextTextLength > maxCharacters) {
        currentEditor.commands.setContent(lastSyncedValueRef.current, {
          emitUpdate: false,
        });
        return;
      }

      const nextHtml = currentEditor.getHTML();
      lastSyncedValueRef.current = nextHtml;
      onChange(nextHtml);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (value === lastSyncedValueRef.current) {
      return;
    }

    editor.commands.setContent(value, { emitUpdate: false });
    lastSyncedValueRef.current = value;
  }, [editor, value]);

  return (
    <div className="admin-product-field admin-product-field-wide">
      <span id={labelId}>
        {label}
        {required ? <span className="admin-field-required" aria-hidden="true">*</span> : null}
      </span>
      <div
        className={
          showToolbar
            ? "admin-rich-text-editor"
            : "admin-rich-text-editor admin-rich-text-editor-plain"
        }
      >
        {showToolbar ? <RichTextToolbar editor={editor} label={label} /> : null}
        <EditorContent aria-labelledby={labelId} editor={editor} />
      </div>
    </div>
  );
}

function countEditorCharacters(value: string) {
  return value.replace(/\s+/g, " ").trim().length;
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

  function promptForYoutube() {
    if (!editor) {
      return;
    }

    const nextUrl = window.prompt("Enter YouTube URL", "");

    if (nextUrl === null || !nextUrl.trim()) {
      return;
    }

    editor.chain().focus().setYoutubeVideo({ src: nextUrl.trim() }).run();
  }

  return (
    <div className="admin-rich-text-toolbar-shell">
      <div className="admin-rich-text-toolbar" role="toolbar" aria-label={label}>
        <div className="admin-rich-text-toolbar-group">
          <ToolbarButton
            active={editor?.isActive("paragraph") ?? false}
            icon="notes"
            label="Body"
            onExecute={() => editor?.chain().focus().setParagraph().run()}
          />
          <ToolbarButton
            active={editor?.isActive("heading", { level: 1 }) ?? false}
            icon="format_h1"
            label="H1"
            onExecute={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          />
          <ToolbarButton
            active={editor?.isActive("heading", { level: 2 }) ?? false}
            icon="format_h2"
            label="H2"
            onExecute={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <ToolbarButton
            active={editor?.isActive("heading", { level: 3 }) ?? false}
            icon="format_h3"
            label="H3"
            onExecute={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          />
        </div>

        <div className="admin-rich-text-toolbar-group">
          <ToolbarButton
            active={editor?.isActive("bold") ?? false}
            icon="format_bold"
            label="Bold"
            onExecute={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            active={editor?.isActive("italic") ?? false}
            icon="format_italic"
            label="Italic"
            onExecute={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            active={editor?.isActive("underline") ?? false}
            icon="format_underlined"
            label="Underline"
            onExecute={() => editor?.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            active={editor?.isActive("strike") ?? false}
            icon="format_strikethrough"
            label="Strike"
            onExecute={() => editor?.chain().focus().toggleStrike().run()}
          />
        </div>

        <div className="admin-rich-text-toolbar-group">
          <ToolbarButton
            active={editor?.isActive("bulletList") ?? false}
            disabled={!(editor?.can().chain().focus().toggleBulletList().run() ?? false)}
            icon="format_list_bulleted"
            label="Bullet"
            onExecute={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            active={editor?.isActive("orderedList") ?? false}
            disabled={!(editor?.can().chain().focus().toggleOrderedList().run() ?? false)}
            icon="format_list_numbered"
            label="Number"
            onExecute={() => editor?.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            active={editor?.isActive("blockquote") ?? false}
            disabled={!(editor?.can().chain().focus().toggleBlockquote().run() ?? false)}
            icon="format_quote"
            label="Quote"
            onExecute={() => editor?.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            active={editor?.isActive("codeBlock") ?? false}
            disabled={!(editor?.can().chain().focus().toggleCodeBlock().run() ?? false)}
            icon="code_blocks"
            label="Code"
            onExecute={() => editor?.chain().focus().toggleCodeBlock().run()}
          />
          <ToolbarButton
            disabled={!(editor?.can().chain().focus().setHorizontalRule().run() ?? false)}
            icon="horizontal_rule"
            label="Divider"
            onExecute={() => editor?.chain().focus().setHorizontalRule().run()}
          />
        </div>

        <div className="admin-rich-text-toolbar-group">
          <ToolbarButton
            active={editor?.isActive("table") ?? false}
            disabled={!(editor?.can().chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() ?? false)}
            icon="table_chart"
            label="Table"
            onExecute={() =>
              editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          />
          <ToolbarButton
            disabled={!editor?.isActive("table")}
            icon="view_column"
            label="Col+"
            onExecute={() => editor?.chain().focus().addColumnAfter().run()}
          />
          <ToolbarButton
            disabled={!editor?.isActive("table")}
            icon="table_rows"
            label="Row+"
            onExecute={() => editor?.chain().focus().addRowAfter().run()}
          />
          <ToolbarButton
            disabled={!editor?.isActive("table")}
            icon="table_view"
            label="Header"
            onExecute={() => editor?.chain().focus().toggleHeaderRow().run()}
          />
          <ToolbarButton
            disabled={!editor?.isActive("table")}
            icon="delete"
            label="Drop Table"
            onExecute={() => editor?.chain().focus().deleteTable().run()}
          />
        </div>

        <div className="admin-rich-text-toolbar-group">
          <ToolbarButton
            active={editor?.isActive("youtube") ?? false}
            icon="smart_display"
            label="YouTube"
            onExecute={promptForYoutube}
          />
          <ToolbarButton
            active={editor?.isActive("link") ?? false}
            icon="link"
            label="Link"
            onExecute={promptForLink}
          />
          <ToolbarButton
            disabled={!editor}
            icon="format_clear"
            label="Clear"
            onExecute={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          />
          <ToolbarButton
            disabled={!(editor?.can().chain().focus().undo().run() ?? false)}
            icon="undo"
            label="Undo"
            onExecute={() => editor?.chain().focus().undo().run()}
          />
          <ToolbarButton
            disabled={!(editor?.can().chain().focus().redo().run() ?? false)}
            icon="redo"
            label="Redo"
            onExecute={() => editor?.chain().focus().redo().run()}
          />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  active = false,
  ariaLabel,
  disabled = false,
  icon,
  label,
  onExecute,
}: ToolbarButtonProps) {
  function handleMouseDown(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    onExecute();
  }

  return (
    <button
      aria-label={ariaLabel ?? label}
      aria-pressed={active}
      className="admin-rich-text-toolbar-button"
      data-active={active ? "true" : "false"}
      disabled={disabled}
      onMouseDown={handleMouseDown}
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
