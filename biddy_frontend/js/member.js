// ===== API 설정 =====
const API_BASE = 'http://localhost:8000/api';  // member-service 주소

// ===== 토큰 관리 =====
const Auth = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  save: (access, refresh) => {
    localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  isLoggedIn: () => !!localStorage.getItem('accessToken'),
};

// ===== 공통 fetch 래퍼 =====
async function apiCall(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = Auth.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  // 핵심: path가 /api로 시작하는지 확인하여 중복 방지
  const fullPath = path.startsWith('/api') ? path.substring(4) : path;
  const res = await fetch(`${API_BASE}${fullPath}`, options);
  
  return handleResponse(res);
}

async function handleResponse(res) {
  const contentType = res.headers.get('Content-Type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = data?.message || data?.error || `오류 ${res.status}`;
    throw new Error(message);
  }

  return data;
}

async function tryRefresh() {
  const refreshToken = Auth.getRefreshToken();
  if (!refreshToken) return false;
  
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!res.ok) return false;
    const data = await res.json();
    Auth.save(data.accessToken, data.refreshToken);
    return true;
  } catch (err) {
    console.error("Refresh 실패:", err);
    return false;
  }
}

// ===== API 함수들 =====

/** 회원가입 */
async function signUp({ email, password, nickname, phone }) {
  return apiCall('POST', '/members/signup', { email, password, nickname, phone });
}

/** 로그인 */
async function login({ email, password }) {
  const data = await apiCall('POST', '/members/login', { email, password });
  Auth.save(data.accessToken, data.refreshToken);
  return data;
}

/** 로그아웃 */
async function logout() {
  try {
    await apiCall('POST', '/members/logout', null, true);
  } finally {
    Auth.clear();
    location.href = '/biddy_frontend/index.html';
  }
}

/** 내 정보 조회 */
async function getMyInfo() {
  return apiCall('GET', '/members/me', null, true);
}

/** 내 정보 수정 */
async function updateMyInfo({ nickname }) {
  return apiCall('PATCH', '/members/me/nickname', { nickname }, true);
}

/** 비밀번호 변경 */
async function changePassword({ currentPassword, newPassword }) {
  return apiCall('PATCH', '/members/me/password', { currentPassword, newPassword }, true);
}





/** 회원 탈퇴 */
async function withdraw() {
  return apiCall('DELETE', '/members/me', null, true);
}

// ===== UI 헬퍼 =====
function showAlert(el, message, type = 'error') {
  el.className = `alert alert-${type} show`;
  el.textContent = message;
}

function hideAlert(el) {
  el.className = 'alert';
  el.textContent = '';
}

function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.dataset.original = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.original || '확인';
  }
}

function formatMoney(amount) {
  return Number(amount).toLocaleString('ko-KR') + '원';
}

function redirectIfNotLoggedIn() {
  if (!Auth.isLoggedIn()) {
    location.href = '/biddy_frontend/pages/login.html';
  }
}

function redirectIfLoggedIn() {
  if (Auth.isLoggedIn()) {
    location.href = '/biddy_frontend/pages/mypage.html';
  }
}