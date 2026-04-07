import axios from 'axios';

/**
 * Server-side requests must hit cluster Services directly. Calling the ingress
 * by in-cluster DNS often returns 502 (wrong controller name/namespace, Host routing).
 * The browser still uses relative URLs and goes through the ingress.
 */
const serverBaseUrlForPath = (pathname) => {
  if (pathname.startsWith('/api/users')) return 'http://auth-srv:3000';
  if (pathname.startsWith('/api/tickets')) return 'http://tickets-srv:3000';
  if (pathname.startsWith('/api/orders')) return 'http://orders-srv:3000';
  if (pathname.startsWith('/api/payments')) return 'http://payments-srv:3000';
  return 'http://auth-srv:3000';
};

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    const client = axios.create();

    client.interceptors.request.use((config) => {
      const raw = config.url || '';
      const pathname = raw.startsWith('http')
        ? new URL(raw).pathname
        : raw;
      config.baseURL = serverBaseUrlForPath(pathname);

      if (req && req.headers) {
        const forward = { ...req.headers };
        delete forward.host;
        delete forward.Host;
        delete forward.connection;
        config.headers = { ...forward, ...config.headers };
      }

      return config;
    });

    return client;
  } else {
    // We must be on the browser
    return axios.create({
      baseURL: '/',
    });
  }
};

export default buildClient;
