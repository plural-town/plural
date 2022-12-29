import { NextApiRequest, NextApiResponse } from "next";

export function nginxGenerator(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if(process.env.NODE_ENV !== "development") {
    res.status(404).send("");
  }

  const template = `
server {
  listen 80;
  listen [::]:80;

  server_name ${process.env.BASE_DOMAIN};

  location / {
    proxy_pass localhost:${process.env.PRODUCTION_PORT};
    include proxy_params;
  }
}
`;

  res.send(template);
}

export default nginxGenerator;
