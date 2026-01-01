import { useEffect, useState } from "react";
import "./App.css";

type TaskItem = {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: string;
};

type TaskComment = {
  id: number;
  taskId: number;
  commentText: string;
  createdAt: string;
};

const API_BASE = "https://localhost:7155";

function App() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // 👉 COMMENT STATE
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // ---------------- TASKS ----------------

  async function fetchTasks() {
    const res = await fetch(`${API_BASE}/api/tasks`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }

 useEffect(() => {
  let ignore = false;

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks`);
      const data = await res.json();

      if (!ignore) {
        setTasks(data);
        setLoading(false);
      }
    } catch {
      if (!ignore) setLoading(false);
    }
  })();

  return () => {
    ignore = true;
  };
}, []);


  async function createTask() {
    if (!newTitle.trim()) return;

    await fetch(`${API_BASE}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, isCompleted: false })
    });

    setNewTitle("");
    fetchTasks();
  }

  async function toggleComplete(task: TaskItem) {
    await fetch(`${API_BASE}/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        isCompleted: !task.isCompleted
      })
    });

    fetchTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
    if (selectedTask?.id === id) {
      setSelectedTask(null);
      setComments([]);
    }
  }

  // ---------------- COMMENTS ----------------

  async function fetchComments(taskId: number) {
    const res = await fetch(`${API_BASE}/api/tasks/${taskId}/comments`);
    const data = await res.json();
    setComments(data);
  }

  async function addComment() {
    if (!selectedTask || !newComment.trim()) return;

    await fetch(`${API_BASE}/api/tasks/${selectedTask.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentText: newComment })
    });

    setNewComment("");
    fetchComments(selectedTask.id);
  }

  async function saveEdit(commentId: number) {
    if (!selectedTask) return;

    await fetch(
      `${API_BASE}/api/tasks/${selectedTask.id}/comments/${commentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentText: editingText })
      }
    );

    setEditingCommentId(null);
    setEditingText("");
    fetchComments(selectedTask.id);
  }

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const notCompletedCount = tasks.length - completedCount;

  return (
    <div className="app-container">
      <h1>Task Dashboard</h1>

      {/* STATS */}
      <div className="stats-grid">
        <div className="card"><h2>{tasks.length}</h2><span>Total Tasks</span></div>
        <div className="card"><h2>{completedCount}</h2><span>Completed</span></div>
        <div className="card"><h2>{notCompletedCount}</h2><span>Not Completed</span></div>
      </div>
      {/* GRAPH */}
<div className="graph">
  {/* CIRCLE GRAPH */}
  <div className="circle-wrapper">
    <div
      className="circle"
      style={{
        background: `conic-gradient(
          #16a34a ${(completedCount / tasks.length) * 360 || 0}deg,
          #dc2626 0deg
        )`
      }}
    >
      <div className="circle-inner">
        <strong>{tasks.length}</strong>
        <span>Total</span>
      </div>
    </div>
  </div>
</div>
      {/* CREATE */}
      <div className="create-row">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="New task..."
        />
        <button className="add" onClick={createTask}>Add Task</button>
      </div>

      {loading && <p>Loading...</p>}



      {/* MAIN LAYOUT */}
      <div className="two-column">
        {/* LEFT: TASK TABLE */}
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr
                key={task.id}
                className={selectedTask?.id === task.id ? "selected-row" : ""}
                onClick={() => {
                  setSelectedTask(task);
                  fetchComments(task.id);
                }}
              >
                <td>{task.title}</td>
                <td
                  className={task.isCompleted ? "complete" : "not-complete"}
                  onClick={e => {
                    e.stopPropagation();
                    toggleComplete(task);
                  }}
                >
                  {task.isCompleted ? "Complete" : "Not Complete"}
                </td>
                <td>
                  <button
                    className="delete"
                    onClick={e => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* RIGHT: COMMENTS */}
        <div className="comment-panel">
          {selectedTask ? (
            <>
              <h3>Comments for:</h3>
              <strong>{selectedTask.title}</strong>

              <div className="comment-list">
                {comments.length === 0 && <p>No comments yet</p>}

                {comments.map(c => (
                  <div key={c.id} className="comment">
                    {editingCommentId === c.id ? (
                      <>
                        <textarea
                          value={editingText}
                          onChange={e => setEditingText(e.target.value)}
                        />
                        <button onClick={() => saveEdit(c.id)}>Save</button>
                      </>
                    ) : (
                      <>
                        <p>{c.commentText}</p>
                        <small>{new Date(c.createdAt).toLocaleString()}</small>
                        <button
                          onClick={() => {
                            setEditingCommentId(c.id);
                            setEditingText(c.commentText);
                          }}
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button className="add" onClick={addComment}>
                Add Comment
              </button>
            </>
          ) : (
            <p>Select a task to view comments</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
