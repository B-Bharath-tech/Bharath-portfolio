
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const emptyProject = {
  number: '',
  category: '',
  title: '',
  description: '',
  tags: '',
  github: '',
  published: true,
};

export default function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newProject, setNewProject] = useState({ ...emptyProject });

  // Editing state
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editProject, setEditProject] = useState({ ...emptyProject });
  const [updating, setUpdating] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  // Check login session
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) setError(error.message);

      setSession(data?.session ?? null);
      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load projects
  const loadProjects = async () => {
    setProjectsLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setProjects(data || []);
    }

    setProjectsLoading(false);
  };

  useEffect(() => {
    if (session) {
      loadProjects();
    } else {
      setProjects([]);
      setProjectsLoading(false);
    }
  }, [session]);

  // Convert form data to the format used by Supabase
  const prepareProjectData = (project) => ({
    number: project.number.trim(),
    category: project.category.trim(),
    title: project.title.trim(),
    description: project.description.trim(),
    tags: project.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    github: project.github.trim() || null,
    published: project.published,
  });

  // Add project
  const handleAddProject = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const projectData = prepareProjectData(newProject);

    const { error } = await supabase
      .from('projects')
      .insert([projectData]);

    if (error) {
      setError(error.message);
    } else {
      setNewProject({ ...emptyProject });
      setShowAddForm(false);
      await loadProjects();
    }

    setSaving(false);
  };

  // Open the edit form with the selected project's current details
  const startEditing = (project) => {
    setError('');
    setShowAddForm(false);
    setEditingProjectId(project.id);

    setEditProject({
      number: project.number || '',
      category: project.category || '',
      title: project.title || '',
      description: project.description || '',
      tags: Array.isArray(project.tags)
        ? project.tags.join(', ')
        : '',
      github: project.github || '',
      published: project.published ?? true,
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProjectId(null);
    setEditProject({ ...emptyProject });
    setError('');
  };

  // Save changes to an existing project
  const handleUpdateProject = async (e) => {
    e.preventDefault();

    if (editingProjectId === null) return;

    setUpdating(true);
    setError('');

    const projectData = prepareProjectData(editProject);

    const { error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', editingProjectId);

    if (error) {
      setError(error.message);
    } else {
      setEditingProjectId(null);
      setEditProject({ ...emptyProject });
      await loadProjects();
    }

    setUpdating(false);
  };


  // Delete a project after the user confirms
  const handleDeleteProject = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingProjectId(project.id);
    setError('');

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id);

    if (error) {
      setError(error.message);
    } else {
      if (editingProjectId === project.id) {
        cancelEditing();
      }
      await loadProjects();
    }

    setDeletingProjectId(null);
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setPassword('');
    setLoading(false);
  };

  // Logout
  const handleLogout = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) setError(error.message);

    setLoading(false);
  };

  if (loading) {
    return <main style={pageStyle}>Checking your session…</main>;
  }

  // Login screen
  if (!session) {
    return (
      <main style={pageStyle}>
        <form onSubmit={handleLogin} style={cardStyle}>
          <h1>Admin Login</h1>
          <p>Sign in to manage your portfolio projects.</p>

          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && <p role="alert" style={errorStyle}>{error}</p>}

          <button type="submit" disabled={loading} style={buttonStyle}>
            Sign in
          </button>

          <p><a href="/">Back to portfolio</a></p>
        </form>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={dashboardStyle}>
        <h1>Portfolio Admin</h1>
        <p>Signed in as {session.user.email}</p>
        <p>Manage the projects displayed on your public portfolio.</p>

        {error && <p role="alert" style={errorStyle}>{error}</p>}

        {/* Dashboard buttons */}
        <div style={toolbarStyle}>
          <h2>Your Projects ({projects.length})</h2>

          <div style={actionGroupStyle}>
            <button
              type="button"
              onClick={() => {
                setError('');
                cancelEditing();
                setShowAddForm((current) => !current);
              }}
              style={buttonStyle}
            >
              {showAddForm ? 'Cancel Add' : '+ Add Project'}
            </button>

            <button
              type="button"
              onClick={loadProjects}
              disabled={projectsLoading}
              style={secondaryButtonStyle}
            >
              {projectsLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Add project form */}
        {showAddForm && (
          <form onSubmit={handleAddProject} style={formStyle}>
            <h2>Add a New Project</h2>

            <ProjectFields
              project={newProject}
              setProject={setNewProject}
              prefix="new"
            />

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={newProject.published}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    published: e.target.checked,
                  })
                }
              />
              Publish on my public portfolio
            </label>

            <button type="submit" disabled={saving} style={buttonStyle}>
              {saving ? 'Saving Project…' : 'Save Project'}
            </button>
          </form>
        )}

        {/* Edit project form */}
        {editingProjectId !== null && (
          <form onSubmit={handleUpdateProject} style={formStyle}>
            <h2>Edit Project</h2>

            <ProjectFields
              project={editProject}
              setProject={setEditProject}
              prefix="edit"
            />

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={editProject.published}
                onChange={(e) =>
                  setEditProject({
                    ...editProject,
                    published: e.target.checked,
                  })
                }
              />
              Publish on my public portfolio
            </label>

            <div style={actionGroupStyle}>
              <button
                type="submit"
                disabled={updating}
                style={buttonStyle}
              >
                {updating ? 'Saving Changes…' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                disabled={updating}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Project list */}
        {projectsLoading ? (
          <p>Loading projects from Supabase…</p>
        ) : projects.length === 0 ? (
          <p>No projects found. Add your first project above.</p>
        ) : (
          <div style={projectListStyle}>
            {projects.map((project) => (
              <article key={project.id} style={projectCardStyle}>
                <div style={projectHeaderStyle}>
                  <h3>{project.title}</h3>

                  <span
                    style={{
                      ...statusStyle,
                      background: project.published ? '#dcfce7' : '#fee2e2',
                      color: project.published ? '#166534' : '#991b1b',
                    }}
                  >
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <p style={categoryStyle}>{project.category}</p>
                <p>{project.description}</p>

                {project.tags?.length > 0 && (
                  <p style={tagStyle}>{project.tags.join(' · ')}</p>
                )}

                {project.github && (
                  <p>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View GitHub repository
                    </a>
                  </p>
                )}

                <div style={actionGroupStyle}>
                  <button
                    type="button"
                    onClick={() => startEditing(project)}
                    style={editButtonStyle}
                    disabled={deletingProjectId === project.id}
                  >
                    Edit Project
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project)}
                    style={deleteButtonStyle}
                    disabled={deletingProjectId === project.id}
                  >
                    {deletingProjectId === project.id ? 'Deleting…' : 'Delete Project'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          style={logoutButtonStyle}
        >
          Sign out
        </button>

        <p><a href="/">View public portfolio</a></p>
      </section>
    </main>
  );
}

// Reusable fields for adding and editing projects
function ProjectFields({ project, setProject, prefix }) {
  const updateField = (field, value) => {
    setProject((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <>
      <label htmlFor={`${prefix}-number`}>Project Number</label>
      <input
        id={`${prefix}-number`}
        type="text"
        placeholder="07"
        value={project.number}
        onChange={(e) => updateField('number', e.target.value)}
        style={inputStyle}
      />

      <label htmlFor={`${prefix}-title`}>Project Title</label>
      <input
        id={`${prefix}-title`}
        type="text"
        required
        value={project.title}
        onChange={(e) => updateField('title', e.target.value)}
        style={inputStyle}
      />

      <label htmlFor={`${prefix}-category`}>Category</label>
      <input
        id={`${prefix}-category`}
        type="text"
        required
        value={project.category}
        onChange={(e) => updateField('category', e.target.value)}
        style={inputStyle}
      />

      <label htmlFor={`${prefix}-description`}>Description</label>
      <textarea
        id={`${prefix}-description`}
        rows={4}
        required
        value={project.description}
        onChange={(e) => updateField('description', e.target.value)}
        style={textareaStyle}
      />

      <label htmlFor={`${prefix}-tags`}>
        Technologies (separate with commas)
      </label>
      <input
        id={`${prefix}-tags`}
        type="text"
        placeholder="Python, React, Supabase"
        value={project.tags}
        onChange={(e) => updateField('tags', e.target.value)}
        style={inputStyle}
      />

      <label htmlFor={`${prefix}-github`}>
        GitHub Repository URL (optional)
      </label>
      <input
        id={`${prefix}-github`}
        type="url"
        placeholder="https://github.com/username/repository"
        value={project.github}
        onChange={(e) => updateField('github', e.target.value)}
        style={inputStyle}
      />
    </>
  );
}

// Styles
const pageStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: '24px',
  boxSizing: 'border-box',
  background: '#f5f7fb',
  fontFamily: 'Arial, sans-serif',
};

const cardStyle = {
  width: '100%',
  maxWidth: '400px',
  padding: '32px',
  boxSizing: 'border-box',
  borderRadius: '16px',
  background: '#fff',
  boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
};

const dashboardStyle = {
  width: '100%',
  maxWidth: '850px',
  padding: '32px',
  boxSizing: 'border-box',
  borderRadius: '16px',
  background: '#fff',
  boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
};

const inputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px',
  marginTop: '8px',
  marginBottom: '18px',
  border: '1px solid #d0d5dd',
  borderRadius: '8px',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  fontFamily: 'Arial, sans-serif',
};

const buttonStyle = {
  padding: '12px 16px',
  border: 0,
  borderRadius: '8px',
  background: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: '#475569',
};

const editButtonStyle = {
  ...buttonStyle,
  marginTop: '12px',
};

const deleteButtonStyle = {
  ...buttonStyle,
  marginTop: '12px',
  background: '#dc2626',
};

const logoutButtonStyle = {
  ...buttonStyle,
  width: '100%',
  marginTop: '24px',
  background: '#dc2626',
};

const toolbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '28px',
  marginBottom: '16px',
};

const actionGroupStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const formStyle = {
  display: 'grid',
  gap: '4px',
  marginBottom: '28px',
  padding: '24px',
  border: '1px solid #dbeafe',
  borderRadius: '12px',
  background: '#f8fafc',
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '16px',
};

const projectListStyle = {
  display: 'grid',
  gap: '16px',
};

const projectCardStyle = {
  padding: '20px',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  overflowWrap: 'anywhere',
};

const projectHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '8px',
};

const categoryStyle = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '1px',
};

const tagStyle = {
  color: '#475569',
  fontSize: '14px',
};

const statusStyle = {
  padding: '5px 10px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold',
};

const errorStyle = {
  color: '#c62828',
  overflowWrap: 'anywhere',
};
