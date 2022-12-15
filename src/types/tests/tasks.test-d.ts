import { expectAssignable } from "tsd";
import { Task, TasksResponseType } from "../tasks";

expectAssignable<TasksResponseType>({
  tasks: [
    {
      id: 42386186,
      status: "IN_PROGRESS",
      submission_time: "2022-12-14T23:16:22Z",
      last_update: "2022-12-14T23:16:23Z",
      start_time: "2022-12-14T23:16:23Z",
      filename: "key_fuErI2yBJPxKT0uF_Products_sync_2022-12-14-23-16-22.tar",
      type: "ingestion",
      protocol: "http",
      bucket_name: "constructor-io",
      object_key: "ingestion/catalogs/prod/companies/1812/key_fuErI2yBJPxKT0uF_Products_sync_2022-12-14-23-16-22.tar",
    }
  ],
  total_count: 40,
  status_counts: {
    QUEUED: 0,
    IN_PROGRESS: 0,
    DONE: 38,
    FAILED: 2,
    CANCELED: 0,
  },
})

expectAssignable<Task>({
  id: 42386186,
  status: "IN_PROGRESS",
  submission_time: "2022-12-14T23:16:22Z",
  last_update: "2022-12-14T23:16:23Z",
  start_time: "2022-12-14T23:16:23Z",
  filename: "key_fuErI2yBJPxKT0uF_Products_sync_2022-12-14-23-16-22.tar",
  type: "ingestion",
  protocol: "http",
  bucket_name: "constructor-io",
  object_key: "ingestion/catalogs/prod/companies/1812/key_fuErI2yBJPxKT0uF_Products_sync_2022-12-14-23-16-22.tar",
})