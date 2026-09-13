import { sendError } from "../utils/http.js";

const normalizeProfiles = (profiles) => {
  const values = Array.isArray(profiles) ? profiles : [profiles];
  return values.map((profile) => String(profile).toLowerCase());
};

const requireProfiles = (...allowedProfiles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, {
      status: 401,
      code: "AUTH_REQUIRED",
      message: "Token de autenticação obrigatório",
      details: [],
    });
  }

  const currentProfile = String(req.user.perfil || "").toLowerCase();
  const allowed = new Set(normalizeProfiles(allowedProfiles));

  if (!allowed.has(currentProfile)) {
    return sendError(res, {
      status: 403,
      code: "FORBIDDEN",
      message: "Acesso proibido para este perfil",
      details: [],
    });
  }

  return next();
};

const requireProfile = (requiredProfile) => requireProfiles(requiredProfile);
const requireAdmin = requireProfiles("admin");

export { requireProfile, requireProfiles, requireAdmin };
