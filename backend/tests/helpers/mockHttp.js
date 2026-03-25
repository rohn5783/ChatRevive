export const createMockResponse = () => {
  const response = {
    statusCode: 200,
    body: null,
    clearedCookies: [],
    cookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    cookie(name, value, options = {}) {
      this.cookies.push({ name, value, options });
      return this;
    },
    clearCookie(name) {
      this.clearedCookies.push(name);
      return this;
    },
  };

  return response;
};

export const createNextSpy = () => {
  const next = () => {
    next.called = true;
  };

  next.called = false;

  return next;
};
