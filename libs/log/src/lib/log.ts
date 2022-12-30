import bunyan from "bunyan";

export const log = bunyan.createLogger({
  name: "plural",
  serializers: bunyan.stdSerializers,
});

export function getLogger(service: string) {
  return log.child({ service });
}
