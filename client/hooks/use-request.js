import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, { ...body, ...props });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      const data = err.response && err.response.data;
      const status = err.response && err.response.status;
      let messages = [];
      if (data && Array.isArray(data.errors)) {
        messages = data.errors.map((e) => e.message || String(e));
      } else if (typeof data === 'string' && data.trim()) {
        if (data.includes('<html') || data.includes('<HTML')) {
          messages = [
            status
              ? `Request failed (${status}). The API did not return JSON — often a proxy/nginx issue.`
              : 'Request failed. The API did not return JSON — often a proxy/nginx issue.',
          ];
        } else {
          messages = [data];
        }
      } else if (err.message) {
        messages = [err.message];
      } else {
        messages = ['Something went wrong'];
      }

      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {messages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};

export default useRequest;
