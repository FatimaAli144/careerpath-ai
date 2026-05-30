// CareerPath AI — Local Authentication using localStorage
window.LocalAuth = (function () {
  const USERS_KEY = 'cp_users';
  const SESSION_KEY = 'cp_session';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return getUsers().find(u => u.id === id) || null;
  }

  function signup(name, email, password, role) {
    if (!name || !name.trim()) return { error: 'Full name is required.' };
    if (!email || !email.trim()) return { error: 'Email is required.' };
    if (!password || password.length < 6) return { error: 'Password must be at least 6 characters.' };
    const users = getUsers();
    if (users.find(u => u.email === email.trim().toLowerCase())) {
      return { error: 'An account with this email already exists.' };
    }
    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      onboarded: role === 'admin',
      profile: null,
      savedJobs: [],
      appliedJobs: [],
      resume: null,
    };
    users.push(user);
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, user.id);
    return { user };
  }

  function login(email, password, role) {
    if (!email || !email.trim()) return { error: 'Email is required.' };
    if (!password) return { error: 'Password is required.' };
    const users = getUsers();
    const user = users.find(
      u => u.email === email.trim().toLowerCase() &&
           u.password === password &&
           u.role === role
    );
    if (!user) return { error: 'Incorrect email, password, or role selected.' };
    localStorage.setItem(SESSION_KEY, user.id);
    return { user };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function updateUser(id, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    return users[idx];
  }

  // Seed default admin account on first run
  function init() {
    const users = getUsers();
    if (!users.find(u => u.role === 'admin')) {
      users.push({
        id: 'admin-default',
        name: 'Admin',
        email: 'admin@careerpath.pk',
        password: 'admin123',
        role: 'admin',
        onboarded: true,
        profile: null,
        savedJobs: [],
        appliedJobs: [],
        resume: null,
      });
      saveUsers(users);
    }
  }

  return { getUsers, getCurrentUser, signup, login, logout, updateUser, init };
})();
