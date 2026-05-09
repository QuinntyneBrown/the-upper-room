// traces_to: L2-091
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    steady_load: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const TEST_USER = __ENV.TEST_USER_ID || 'lead';

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/contacts`, {
    headers: { 'X-Test-User-Id': TEST_USER },
  });
  check(res, {
    'status 200': (r) => r.status === 200,
    'has items': (r) => {
      try { return JSON.parse(r.body).items !== undefined; } catch { return false; }
    },
  });
  sleep(0.1);
}
