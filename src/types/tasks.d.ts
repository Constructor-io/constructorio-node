import { NetworkParameters } from "./types";

export = Tasks;

interface TasksParameters {
  numResultsPerPage?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
}

declare class Tasks {
  constructor(options: ConstructorClientOptions);
  options: ConstructorClientOptions;

  getAllTasks(
    parameters?: TasksParameters,
    networkParameters?: NetworkParameters
  ): Promise<Tasks.Response>;

  getTask(
    parameters?: {
      id: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<Tasks.SingleTaskResponse>;
}

/* tasks results returned from server */
declare namespace Tasks {
  export interface Response {
    total_count: number;
    tasks: Partial<Task>[];
    status_counts: {
      QUEUED: number;
      DONE: number;
      IN_PROGRESS: number;
      FAILED: number;
    };
  }
  export type SingleTaskResponse = Task;
}

type TaskStatus = "QUEUED" | "DONE" | "FAILED" | "IN_PROGRESS";

interface Task extends Record<string, any> {
  id: number;
  type: "ingestion" | "user_data_request";
  status: TaskStatus;
  submission_time: string;
  last_update: null;
  filename: string;
  protocol: "ftp" | "http" | null;
  result?: {
    changelog?: Partial<ChangeLog>;
  };
}

interface ChangeLog extends Record<string, any> {
  sections?: {
    [key: string]: {
      items_updated: number;
      items_deleted: number;
      variations_updated: number;
      variations_deleted: number;
    };
  };
  index_built: built;
}
