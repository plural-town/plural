//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require("@nrwl/next/plugins/with-nx");

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },

  trailingSlash: true,

  async rewrites() {
    return [
      {
        source: "/.well-known/webfinger",
        destination: "/api/.well-known/webfinger",
      },
      {
        source: "/:tag(\\@[a-zA-Z0-9-_]+)",
        destination: "/profile/:tag",
      },
      {
        source: "/:username(\\@[a-zA-Z0-9-_]+)\\@:server([a-zA-Z-_.0-9]+)",
        destination: "/remote/byServer/@:server/byUser/:username",
      },
    ];
  },
};

module.exports = withNx(nextConfig);
