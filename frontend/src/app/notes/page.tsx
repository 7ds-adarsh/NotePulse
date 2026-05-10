"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/Toast";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type Note = {
    id: number;
    title: string | null;
    content: string;
    formatting: string;
    created_at: string;
};

type UserProfile = {
    email: string;
};

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [formatting, setFormatting] = useState("{}");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState("");
    const [editingTitle, setEditingTitle] = useState("");
    const [editingFormatting, setEditingFormatting] = useState("{}");
    const router = useRouter();
    const { addToast } = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch(`${apiBase}/api/auth/profile`, {
                credentials: "include",
            });

            if (!res.ok) {
                router.push("/login");
                return;
            }

            const data = await res.json();
            setUser(data);
        };

        checkAuth();
    }, [router]);

    const fetchNotes = async () => {
        try {
            const res = await fetch(`${apiBase}/api/notes/`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

            const data = await res.json();
            setNotes(data);
        } catch (error) {
            console.error("Error fetching notes:", error);
            setNotes([]);
            addToast("Failed to load notes", "error");
        } finally {
            setLoading(false);
        }
    };

    const addNote = async () => {
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${apiBase}/api/notes/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content, title: title.trim() || null, formatting }),
            });

            if (!res.ok) throw new Error(`Add failed: ${res.status}`);

            setContent("");
            setTitle("");
            setFormatting("{}");
            await fetchNotes();
            addToast("Note added successfully!", "success");
        } catch (error) {
            console.error("Error adding note:", error);
            addToast("Failed to add note", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateNote = async (
        noteId: number,
        newContent: string,
        newTitle: string | null,
        newFormatting: string
    ) => {
        try {
            const res = await fetch(`${apiBase}/api/notes/${noteId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: newContent, title: newTitle, formatting: newFormatting }),
            });

            if (!res.ok) throw new Error(`Update failed: ${res.status}`);

            await fetchNotes();
            addToast("Note updated successfully!", "success");
        } catch (error) {
            console.error("Error updating note:", error);
            addToast("Failed to update note", "error");
        }
    };

    const deleteNote = async (noteId: number) => {
        if (deletingId) return;

        setDeletingId(noteId);
        try {
            const res = await fetch(`${apiBase}/api/notes/${noteId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

            await fetchNotes();
            addToast("Note deleted successfully", "success");
        } catch (error) {
            console.error("Error deleting note:", error);
            addToast("Failed to delete note", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const startEditing = (note: Note) => {
        setEditingId(note.id);
        setEditingContent(note.content);
        setEditingTitle(note.title || "");
        setEditingFormatting(note.formatting || "{}");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingContent("");
        setEditingTitle("");
        setEditingFormatting("{}");
    };

    const saveEdit = async () => {
        if (!editingContent.trim() || !editingId) return;

        await updateNote(editingId, editingContent, editingTitle.trim() || null, editingFormatting);
        cancelEditing();
    };

    const renderFormattedText = (text: string) => {
        if (!text) return text;

        // Simple markdown-like rendering
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .replace(/`(.*?)`/g, '<code class="bg-slate-700 px-1 py-0.5 rounded text-sm text-slate-200">$1</code>') // Code
            .replace(/^- (.*)$/gm, '• $1') // Bullet points
            .replace(/\n/g, '<br/>'); // Line breaks
    };

    const filteredNotes = notes.filter(note =>
        (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            addNote();
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotes();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-xl text-slate-300">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex items-center gap-3 text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-blue-600"></div>
                    <span className="text-lg">Loading your notes...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-800/50 border-b border-slate-700/50 sticky my-3 top-0 z-10 backdrop-blur-sm rounded-xl p-4">
                {/* Search Bar */}
                <div className="max-w-3xl mx-auto px-4 pb-4">
                    <div className="relative">
                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-600/50 bg-slate-700/50 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Input Section */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl backdrop-blur-sm p-6 mb-8">
                    <div className="relative">
                        {/* Title Input */}
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Note title (optional)"
                            className="w-full mb-3 rounded-xl border border-slate-600/50 bg-slate-700/50 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg font-medium"
                        />

                        {/* Text Formatting Toolbar */}
                        <div className="mb-3 flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    const textarea = document.querySelector('textarea');
                                    if (textarea) {
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const selectedText = content.substring(start, end);
                                        const beforeText = content.substring(0, start);
                                        const afterText = content.substring(end);
                                        setContent(beforeText + `**${selectedText || 'bold text'}**` + afterText);
                                    }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
                                title="Bold"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                                </svg>
                                Bold
                            </button>
                            <button
                                onClick={() => {
                                    const textarea = document.querySelector('textarea');
                                    if (textarea) {
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const selectedText = content.substring(start, end);
                                        const beforeText = content.substring(0, start);
                                        const afterText = content.substring(end);
                                        setContent(beforeText + `*${selectedText || 'italic text'}*` + afterText);
                                    }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
                                title="Italic"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H7a2 2 0 00-2 2v10a2 2 0 002 2h4m6-14h-4a2 2 0 00-2 2v10a2 2 0 002 2h4" />
                                </svg>
                                Italic
                            </button>
                            <button
                                onClick={() => {
                                    const textarea = document.querySelector('textarea');
                                    if (textarea) {
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const selectedText = content.substring(start, end);
                                        const beforeText = content.substring(0, start);
                                        const afterText = content.substring(end);
                                        setContent(beforeText + `\`${selectedText || 'code'}\`` + afterText);
                                    }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
                                title="Code"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Code
                            </button>
                            <button
                                onClick={() => {
                                    const textarea = document.querySelector('textarea');
                                    if (textarea) {
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const selectedText = content.substring(start, end);
                                        const beforeText = content.substring(0, start);
                                        const afterText = content.substring(end);
                                        setContent(beforeText + `- ${selectedText || 'list item'}` + afterText);
                                    }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
                                title="Bullet List"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                List
                            </button>
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What's on your mind? (Press Enter to save)"
                            rows={4}
                            className="w-full resize-none rounded-xl border border-slate-600/50 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                {content.length > 0 && `${content.length} characters`}
                            </span>
                            <button
                                onClick={addNote}
                                disabled={!content.trim() || isSubmitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Note
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notes List */}
                {filteredNotes.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {searchQuery ? "No notes found" : "No notes yet"}
                        </h3>
                        <p className="text-slate-500">
                            {searchQuery
                                ? "Try adjusting your search terms"
                                : "Create your first note above to get started"
                            }
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-4 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotes.map((note, index) => (
                            <div
                                key={note.id}
                                className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-200"
                                style={{
                                    animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                                }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {editingId === note.id ? (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    placeholder="Note title (optional)"
                                                    className="w-full rounded-lg border border-slate-600/50 bg-slate-700/50 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                                />
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const textarea = document.querySelector<HTMLTextAreaElement>(`textarea[data-editing="${editingId}"]`);
                                                            if (textarea) {
                                                                const start = textarea.selectionStart;
                                                                const end = textarea.selectionEnd;
                                                                const selectedText = editingContent.substring(start, end);
                                                                const beforeText = editingContent.substring(0, start);
                                                                const afterText = editingContent.substring(end);
                                                                setEditingContent(beforeText + `**${selectedText || 'bold text'}**` + afterText);
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                                                        title="Bold"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                                                        </svg>
                                                        Bold
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const textarea = document.querySelector<HTMLTextAreaElement>(`textarea[data-editing="${editingId}"]`);
                                                            if (textarea) {
                                                                const start = textarea.selectionStart;
                                                                const end = textarea.selectionEnd;
                                                                const selectedText = editingContent.substring(start, end);
                                                                const beforeText = editingContent.substring(0, start);
                                                                const afterText = editingContent.substring(end);
                                                                setEditingContent(beforeText + `*${selectedText || 'italic text'}*` + afterText);
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                                                        title="Italic"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H7a2 2 0 00-2 2v10a2 2 0 002 2h4m6-14h-4a2 2 0 00-2 2v10a2 2 0 002 2h4" />
                                                        </svg>
                                                        Italic
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const textarea = document.querySelector<HTMLTextAreaElement>(`textarea[data-editing="${editingId}"]`);
                                                            if (textarea) {
                                                                const start = textarea.selectionStart;
                                                                const end = textarea.selectionEnd;
                                                                const selectedText = editingContent.substring(start, end);
                                                                const beforeText = editingContent.substring(0, start);
                                                                const afterText = editingContent.substring(end);
                                                                setEditingContent(beforeText + `\`${selectedText || 'code'}\`` + afterText);
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                                                        title="Code"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                                        </svg>
                                                        Code
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={editingContent}
                                                    onChange={(e) => setEditingContent(e.target.value)}
                                                    data-editing={editingId}
                                                    className="w-full resize-none rounded-lg border border-slate-600/50 bg-slate-700/50 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    rows={3}
                                                    placeholder="Edit your note..."
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={saveEdit}
                                                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {note.title && (
                                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">
                                                        {note.title}
                                                    </h3>
                                                )}
                                                <div
                                                    className="text-slate-900 leading-relaxed whitespace-pre-wrap break-words prose prose-slate max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: renderFormattedText(note.content) }}
                                                />
                                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {note.created_at ? new Date(note.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : 'Just now'}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {editingId !== note.id && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button
                                                onClick={() => startEditing(note)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit note"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => deleteNote(note.id)}
                                                disabled={deletingId === note.id}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-100"
                                                title="Delete note"
                                            >
                                                {deletingId === note.id ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <style jsx global>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}