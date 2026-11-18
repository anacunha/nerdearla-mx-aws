import { useEffect, useState, type FormEvent } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

type Note = Schema["Note"]["type"];

const client = generateClient<Schema>();

function Notes({ email, onSignOut }: { email?: string; onSignOut?: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sub = client.models.Note.observeQuery().subscribe({
      next: ({ items }) =>
        setNotes(
          [...items].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
        ),
      error: () => setError("No se pudieron cargar las notas."),
    });
    return () => sub.unsubscribe();
  }, []);

  function resetForm() {
    setTitle("");
    setContent("");
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    try {
      const { errors } = editingId
        ? await client.models.Note.update({ id: editingId, title: title.trim(), content })
        : await client.models.Note.create({ title: title.trim(), content });
      if (errors) throw new Error(errors[0].message);
      resetForm();
    } catch {
      setError("No se pudo guardar la nota.");
    }
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content ?? "");
  }

  async function deleteNote(id: string) {
    if (!window.confirm("¿Borrar esta nota?")) return;
    const { errors } = await client.models.Note.delete({ id });
    if (errors) setError("No se pudo borrar la nota.");
    if (editingId === id) resetForm();
  }

  return (
    <main className="app">
      <header className="topbar">
        <img src="/nerdearla-logo.webp" alt="Nerdearla" className="logo" />
        <div className="user">
          <span>{email}</span>
          <button className="secondary" onClick={onSignOut}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <h1>Mis notas</h1>

      <form className="editor" onSubmit={handleSubmit}>
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />
        <textarea
          placeholder="Escribe tu nota…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <div className="actions">
          {editingId && (
            <button type="button" className="secondary" onClick={resetForm}>
              Cancelar
            </button>
          )}
          <button type="submit">{editingId ? "Guardar cambios" : "Agregar nota"}</button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      {notes.length === 0 ? (
        <p className="empty">Todavía no tienes notas. Escribe la primera arriba.</p>
      ) : (
        <ul className="notes">
          {notes.map((note) => (
            <li key={note.id} className={note.id === editingId ? "note editing" : "note"}>
              <h2>{note.title}</h2>
              {note.content && <p>{note.content}</p>}
              <div className="note-actions">
                <button className="link" onClick={() => startEdit(note)}>
                  Editar
                </button>
                <button className="link danger" onClick={() => deleteNote(note.id)}>
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function App() {
  return (
    <Authenticator loginMechanisms={["email"]}>
      {({ signOut, user }) => (
        <Notes email={user?.signInDetails?.loginId} onSignOut={signOut} />
      )}
    </Authenticator>
  );
}
