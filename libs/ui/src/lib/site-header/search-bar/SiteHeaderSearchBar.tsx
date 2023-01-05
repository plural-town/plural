import {
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  useInterval,
  useToast,
} from "@chakra-ui/react";
import { ImportResponse, ImportResponseSchema, ImportStatusResponse } from "@plural/schema";
import { useQuery } from "@tanstack/react-query";
import { Field, FieldProps, Form, Formik } from "formik";
import { DateTime, Duration } from "luxon";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaSearchPlus } from "react-icons/fa";

/* eslint-disable-next-line */
export interface SiteHeaderSearchBarProps {}

export function SiteHeaderSearchBar(props: SiteHeaderSearchBarProps) {
  const STATUS_REFRESH_INTERVAL = 1000;
  const TIMEOUT = Duration.fromObject({ seconds: 30 });
  const router = useRouter();
  const toast = useToast();
  const [searching, setSearching] = useState(false);
  const [searchQueued, setSearchQueued] = useState(false);
  const [queueStart, setQueueStart] = useState<DateTime | false>(false);
  const [queueElapsed, setQueueElapsed] = useState<Duration>(Duration.fromMillis(0));
  const [taskId, setTaskId] = useState<string | false>(false);
  // TODO: write query to keep fetching 'taskId' status

  useQuery({
    queryKey: ["entitySearchStatus", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/search/import-status?search=${taskId}`);
      const data = (await res.json()) as ImportStatusResponse;
      if (data.status === "ok" && data.queued === false && data.entityFound === true) {
        setSearching(false);
        setSearchQueued(false);
        router.push(data.url);
      }
    },
    enabled: taskId !== false,
    refetchInterval: searchQueued ? STATUS_REFRESH_INTERVAL : false,
  });

  useInterval(
    () => {
      if (queueStart === false) {
        return;
      }
      const elapsed = DateTime.now().diff(queueStart);
      if (elapsed > TIMEOUT) {
        toast({
          title: "Import still queued",
          // TODO: better description
          // TODO: Link to "More Info" (in documentation)
          description:
            "The server has a long queue of content it is trying to fetch. The URL submitted will be fetched when the server has a chance, but that is taking longer than expected. Please try again later.",
          status: "warning",
          position: "top-right",
          isClosable: true,
        });
        setQueueElapsed(Duration.fromMillis(0));
        setSearchQueued(false);
        setSearching(false);
        return;
      }
      setQueueElapsed(elapsed);
    },
    searchQueued ? 25 : null,
  );

  return (
    <Formik
      initialValues={{
        q: "",
      }}
      onSubmit={async ({ q }) => {
        if (q.startsWith("http")) {
          setSearching(true);
          setSearchQueued(false);
          const res = await fetch("/api/search/import/", {
            method: "POST",
            body: JSON.stringify({ url: q }),
          });
          const data = (await ImportResponseSchema.validate(await res.json())) as ImportResponse;
          if (data.status === "failure") {
            setSearching(false);
            return;
          }

          if (data.queued === true) {
            setSearchQueued(true);
            setTaskId(data.query);
            setQueueStart(DateTime.now());
            return;
          }

          if (data.entityFound === false) {
            setSearching(false);
            toast({
              title: "Entity not found",
              description: "The URL entered doesn't seem to be a profile or toot.",
              status: "warning",
              position: "top-right",
              isClosable: true,
            });
            return;
          }

          if (data.entityType === "NOTE") {
            setSearching(false);
            router.push(data.url);
            return;
          }
          if (data.entityType === "PERSON") {
            setSearching(false);
            router.push(data.url);
            return;
          }
          return;
        }
        if (q.startsWith("@")) {
          // TODO: Handle username search
          // return;
        }
        if (q.startsWith("#")) {
          // TODO: Handle hashtag search
          // return;
        }
        router.push(`/search/?q=${encodeURIComponent(q)}`);
        return;
      }}
    >
      <Form method="POST" action="/search/" style={{ width: "100%" }}>
        <Field name="q">
          {({ field }: FieldProps) => (
            <InputGroup>
              <InputLeftElement pointerEvents="none" children={<FaSearchPlus />} />
              <Input placeholder="Search" {...field} variant="filled" bg="blue.100" />
            </InputGroup>
          )}
        </Field>
        {searching && (
          <Progress
            isIndeterminate={!searchQueued}
            size="xs"
            value={100 * (queueElapsed.toMillis() / TIMEOUT.toMillis())}
          />
        )}
      </Form>
    </Formik>
  );
}

export default SiteHeaderSearchBar;
