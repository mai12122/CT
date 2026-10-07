export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const target =
        'http://ct-alb-1014590895.ap-southeast-1.elb.amazonaws.com' +
        url.pathname + url.search;
      return fetch(new Request(target, request));
    }
    return env.ASSETS.fetch(request);
  },
};